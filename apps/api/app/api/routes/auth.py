from datetime import datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.db import get_db
from app.core.auth import get_current_user, hash_password, verify_password
from app.models.user import User
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.invitation import Invitation
from app.services.category_service import seed_default_categories

router = APIRouter(prefix="/auth", tags=["auth"])


class UserProfileResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrgMembershipResponse(BaseModel):
    id: UUID
    organization_id: UUID
    organization_name: str
    invite_code: str
    has_password: bool = False
    role: str
    status: str


class AuthMeResponse(BaseModel):
    user: UserProfileResponse
    memberships: List[OrgMembershipResponse]
    has_organization: bool


class InitialInviteRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    role: Optional[str] = "accountant"


class CreateOrgRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Organization name")
    password: Optional[str] = Field(None, min_length=4, description="Organization password")
    initial_invitations: Optional[List[InitialInviteRequest]] = Field(default=[], description="Initial team member invitations")


class JoinOrgRequest(BaseModel):
    invite_code_or_id: str = Field(..., min_length=1, description="Organization name, ID, or invite code")
    password: Optional[str] = Field(None, description="Organization joining password")
    requested_role: Optional[str] = Field("accountant", description="Requested role (never owner)")


class UpdateProfileRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255, description="Updated user full name")


@router.get("/me", response_model=AuthMeResponse, status_code=status.HTTP_200_OK)
def get_auth_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns authenticated user identity, active organization memberships,
    and onboarding state. Automatically matches and accepts pending invitations
    matching the normalized authenticated email.
    """
    user_email_normalized = current_user.email.strip().lower()

    # Process pending invitations for this authenticated email
    pending_invites = (
        db.query(Invitation)
        .filter(
            func.lower(Invitation.invited_email) == user_email_normalized,
            Invitation.status == "pending",
        )
        .all()
    )

    for inv in pending_invites:
        # Check if membership already exists
        existing_m = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == inv.organization_id,
                OrganizationMember.user_id == current_user.id,
            )
            .first()
        )

        assigned_role = inv.invited_role if inv.invited_role in ["admin", "accountant", "viewer"] else "accountant"

        if existing_m:
            existing_m.status = "active"
            existing_m.role = assigned_role
        else:
            new_m = OrganizationMember(
                organization_id=inv.organization_id,
                user_id=current_user.id,
                role=assigned_role,
                status="active",
            )
            db.add(new_m)

        inv.status = "accepted"
        inv.accepted_at = datetime.utcnow()

    if pending_invites:
        db.commit()

    # Query all active memberships
    memberships = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.status == "active",
        )
        .all()
    )

    membership_responses: List[OrgMembershipResponse] = []
    for m in memberships:
        org = db.query(Organization).filter(Organization.id == m.organization_id).first()
        if org:
            membership_responses.append(
                OrgMembershipResponse(
                    id=m.id,
                    organization_id=m.organization_id,
                    organization_name=org.name,
                    invite_code=org.invite_code,
                    has_password=bool(org.password_hash),
                    role=m.role,
                    status=m.status,
                )
            )

    return AuthMeResponse(
        user=UserProfileResponse.model_validate(current_user),
        memberships=membership_responses,
        has_organization=len(membership_responses) > 0,
    )


@router.post("/create-org", response_model=OrgMembershipResponse, status_code=status.HTTP_201_CREATED)
def create_organization_auth(
    payload: CreateOrgRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new organization for the authenticated user.
    Assigns user role='owner', hashes password securely, stores initial team invitations,
    and seeds default starter categories.
    """
    password_hash = hash_password(payload.password) if payload.password else None
    org = Organization(name=payload.name, password_hash=password_hash)
    db.add(org)
    db.commit()
    db.refresh(org)

    # Create membership record as owner (derived automatically from current_user.id)
    member = OrganizationMember(
        organization_id=org.id,
        user_id=current_user.id,
        role="owner",
        status="active",
    )
    db.add(member)

    # Store initial team invitations if provided
    if payload.initial_invitations:
        for inv_req in payload.initial_invitations:
            clean_email = inv_req.email.strip().lower()
            # Do not invite creator as a pending team member
            if clean_email == current_user.email.strip().lower():
                continue
            
            clean_role = inv_req.role if inv_req.role in ["admin", "accountant", "viewer"] else "accountant"
            invitation = Invitation(
                organization_id=org.id,
                invited_email=clean_email,
                invited_name=inv_req.name.strip(),
                invited_role=clean_role,
                status="pending",
            )
            db.add(invitation)

    db.commit()
    db.refresh(member)

    # Seed default starter categories
    seed_default_categories(db=db, organization_id=org.id)

    return OrgMembershipResponse(
        id=member.id,
        organization_id=org.id,
        organization_name=org.name,
        invite_code=org.invite_code,
        has_password=bool(org.password_hash),
        role=member.role,
        status=member.status,
    )


@router.post("/join-org", response_model=OrgMembershipResponse, status_code=status.HTTP_200_OK)
def join_organization_auth(
    payload: JoinOrgRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Joins an existing organization using Organization Name, ID, or invite_code + password.
    Enforces server-side security: users CANNOT self-assign 'owner' role.
    """
    query_str = payload.invite_code_or_id.strip()

    # Reject attempt to self-assign Owner role
    if payload.requested_role and payload.requested_role.strip().lower() == "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Joining users cannot self-assign the Owner role.",
        )

    # Find organization by invite code, name, or UUID ID
    org = db.query(Organization).filter(
        (Organization.invite_code == query_str) | (func.lower(Organization.name) == query_str.lower())
    ).first()
    if not org:
        try:
            org_id = UUID(query_str)
            org = db.query(Organization).filter(Organization.id == org_id).first()
        except ValueError:
            pass

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found. Please check the organization name or invite code.",
        )

    # Verify password if password_hash exists on organization
    if org.password_hash:
        if not payload.password or not verify_password(payload.password, org.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid organization password. Access denied.",
            )

    assigned_role = payload.requested_role if payload.requested_role in ["admin", "accountant", "viewer"] else "accountant"

    # Check if membership already exists
    existing_member = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == org.id,
            OrganizationMember.user_id == current_user.id,
        )
        .first()
    )

    if existing_member:
        if existing_member.status != "active":
            existing_member.status = "active"
            existing_member.role = assigned_role
            db.commit()
            db.refresh(existing_member)
        return OrgMembershipResponse(
            id=existing_member.id,
            organization_id=org.id,
            organization_name=org.name,
            invite_code=org.invite_code,
            has_password=bool(org.password_hash),
            role=existing_member.role,
            status=existing_member.status,
        )

    # Create new membership
    member = OrganizationMember(
        organization_id=org.id,
        user_id=current_user.id,
        role=assigned_role,
        status="active",
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return OrgMembershipResponse(
        id=member.id,
        organization_id=org.id,
        organization_name=org.name,
        invite_code=org.invite_code,
        has_password=bool(org.password_hash),
        role=member.role,
        status=member.status,
    )


@router.put("/profile", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
def update_user_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates the authenticated user's display name/full_name in PostgreSQL.
    Identity is derived strictly from the authenticated JWT.
    """
    current_user.full_name = payload.full_name.strip()
    db.commit()
    db.refresh(current_user)
    return UserProfileResponse.model_validate(current_user)
