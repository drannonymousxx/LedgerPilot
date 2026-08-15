from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
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
    role: str
    status: str


class AuthMeResponse(BaseModel):
    user: UserProfileResponse
    memberships: List[OrgMembershipResponse]
    has_organization: bool


class CreateOrgRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Organization name")


class JoinOrgRequest(BaseModel):
    invite_code_or_id: str = Field(..., min_length=2, description="Organization ID or invite code")


@router.get("/me", response_model=AuthMeResponse, status_code=status.HTTP_200_OK)
def get_auth_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns authenticated user identity, active organization memberships,
    and onboarding state.
    """
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
    Assigns user role='owner' and seeds default starter categories.
    """
    org = Organization(name=payload.name)
    db.add(org)
    db.commit()
    db.refresh(org)

    # Create membership record as owner
    member = OrganizationMember(
        organization_id=org.id,
        user_id=current_user.id,
        role="owner",
        status="active",
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    # Seed default starter categories
    seed_default_categories(db=db, organization_id=org.id)

    return OrgMembershipResponse(
        id=member.id,
        organization_id=org.id,
        organization_name=org.name,
        invite_code=org.invite_code,
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
    Joins an existing organization using Organization ID or invite_code.
    Assigns user default role='accountant' (never owner/admin).
    """
    query_str = payload.invite_code_or_id.strip()

    # Search by invite code or UUID ID
    org = db.query(Organization).filter(Organization.invite_code == query_str).first()
    if not org:
        try:
            org_id = UUID(query_str)
            org = db.query(Organization).filter(Organization.id == org_id).first()
        except ValueError:
            pass

    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found. Please check the organization ID or invite code.",
        )

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
            db.commit()
            db.refresh(existing_member)
        return OrgMembershipResponse(
            id=existing_member.id,
            organization_id=org.id,
            organization_name=org.name,
            invite_code=org.invite_code,
            role=existing_member.role,
            status=existing_member.status,
        )

    # Create new membership with role='accountant'
    member = OrganizationMember(
        organization_id=org.id,
        user_id=current_user.id,
        role="accountant",
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
        role=member.role,
        status=member.status,
    )
