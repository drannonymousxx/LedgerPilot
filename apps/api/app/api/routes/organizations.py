from datetime import datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.core.config import settings
from app.core.limiter import limiter
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, get_current_org_membership, hash_password, verify_password

from app.models.user import User
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.invitation import Invitation
from app.models.message import Message
from app.services.category_service import seed_default_categories, get_org_categories

router = APIRouter(prefix="/organizations", tags=["organizations"])


class CategoryResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class OrganizationCreate(BaseModel):
    name: str


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    invite_code: str
    has_password: bool = False
    role: str = "member"

    model_config = ConfigDict(from_attributes=True)


class TeamMemberItemResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    name: str
    email: str
    role: str
    status: str
    is_pending: bool
    created_at: datetime


class SendMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="Chat message text")


class ChatMessageResponse(BaseModel):
    id: UUID
    organization_id: UUID
    sender_user_id: UUID
    sender_name: str
    sender_email: str
    sender_role: str
    message: str
    created_at: datetime


class SetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=4, description="New organization joining password")


class InviteMemberRequest(BaseModel):
    email: str = Field(..., min_length=3, description="Invited member email")
    name: Optional[str] = Field(None, description="Invited member display name")
    role: Optional[str] = Field("accountant", description="Assigned member role")


@router.get("", response_model=List[OrganizationResponse], status_code=status.HTTP_200_OK)
def list_organizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all organizations that the authenticated user is an active member of.
    """
    memberships = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.status == "active",
        )
        .all()
    )

    org_responses: List[OrganizationResponse] = []
    for m in memberships:
        org = db.query(Organization).filter(Organization.id == m.organization_id).first()
        if org:
            org_responses.append(
                OrganizationResponse(
                    id=org.id,
                    name=org.name,
                    invite_code=org.invite_code,
                    has_password=bool(org.password_hash),
                    role=m.role,
                )
            )

    return org_responses


@router.get("/{id}/categories", response_model=List[CategoryResponse], status_code=status.HTTP_200_OK)
def get_categories(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all categories for an organization (verifies user membership first).
    """
    # Enforce organization membership authorization
    get_current_org_membership(organization_id=id, current_user=current_user, db=db)

    categories = get_org_categories(db=db, organization_id=id)
    return categories


@router.get("/{id}/members", response_model=List[TeamMemberItemResponse], status_code=status.HTTP_200_OK)
def get_organization_members(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all active members and pending invitations for an organization.
    Verifies user membership first.
    """
    get_current_org_membership(organization_id=id, current_user=current_user, db=db)

    # 1. Fetch active/registered members
    memberships = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.organization_id == id)
        .all()
    )

    items: List[TeamMemberItemResponse] = []
    for m in memberships:
        user_rec = db.query(User).filter(User.id == m.user_id).first()
        if user_rec:
            items.append(
                TeamMemberItemResponse(
                    id=m.id,
                    user_id=user_rec.id,
                    name=user_rec.full_name or user_rec.email.split("@")[0],
                    email=user_rec.email,
                    role=m.role,
                    status=m.status,
                    is_pending=False,
                    created_at=m.created_at,
                )
            )

    # 2. Fetch pending invitations
    invites = (
        db.query(Invitation)
        .filter(Invitation.organization_id == id, Invitation.status == "pending")
        .all()
    )
    for inv in invites:
        items.append(
            TeamMemberItemResponse(
                id=inv.id,
                user_id=None,
                name=inv.invited_name,
                email=inv.invited_email,
                role=inv.invited_role,
                status="pending",
                is_pending=True,
                created_at=inv.created_at,
            )
        )

    return items


@router.get("/{id}/messages", response_model=List[ChatMessageResponse], status_code=status.HTTP_200_OK)
def list_organization_messages(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get organization-scoped community chat messages.
    Strictly isolated: users from Organization A cannot access Organization B messages.
    """
    get_current_org_membership(organization_id=id, current_user=current_user, db=db)

    messages = (
        db.query(Message)
        .filter(Message.organization_id == id)
        .order_by(Message.created_at.asc())
        .all()
    )

    results: List[ChatMessageResponse] = []
    for msg in messages:
        sender_user = db.query(User).filter(User.id == msg.sender_user_id).first()
        sender_mem = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == id,
                OrganizationMember.user_id == msg.sender_user_id,
            )
            .first()
        )
        sender_role = sender_mem.role if sender_mem else "member"

        results.append(
            ChatMessageResponse(
                id=msg.id,
                organization_id=msg.organization_id,
                sender_user_id=msg.sender_user_id,
                sender_name=sender_user.full_name or sender_user.email.split("@")[0] if sender_user else "User",
                sender_email=sender_user.email if sender_user else "",
                sender_role=sender_role,
                message=msg.message,
                created_at=msg.created_at,
            )
        )

    return results


@router.post("/{id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
def create_organization_message(
    id: UUID,
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sends an organization-scoped chat message.
    Derives sender identity strictly from current_user.id.
    """
    membership = get_current_org_membership(organization_id=id, current_user=current_user, db=db)

    msg = Message(
        organization_id=id,
        sender_user_id=current_user.id,
        message=payload.message.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return ChatMessageResponse(
        id=msg.id,
        organization_id=msg.organization_id,
        sender_user_id=current_user.id,
        sender_name=current_user.full_name or current_user.email.split("@")[0],
        sender_email=current_user.email,
        sender_role=membership.role,
        message=msg.message,
        created_at=msg.created_at,
    )


@router.post("/{id}/password", status_code=status.HTTP_200_OK)
@limiter.limit(settings.RATE_LIMIT_SET_PASSWORD)
def set_organization_password(
    request: Request,
    id: UUID,
    payload: SetPasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    """
    Sets or updates the organization joining password.
    Enforces server-side authorization: ONLY the organization Owner can manage passwords.
    """
    membership = get_current_org_membership(organization_id=id, current_user=current_user, db=db)
    if membership.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only the organization Owner can set or change the organization password.",
        )

    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")

    org.password_hash = hash_password(payload.new_password.strip())
    db.commit()

    return {"status": "ok", "message": "Organization password updated successfully.", "has_password": True}


@router.post("/{id}/invitations", response_model=TeamMemberItemResponse, status_code=status.HTTP_201_CREATED)
def invite_organization_member(
    id: UUID,
    payload: InviteMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Invites a new team member to the organization by email.
    Enforces server-side authorization: Only Owner or Admin can send invitations.
    Cannot invite someone as Owner.
    """
    membership = get_current_org_membership(organization_id=id, current_user=current_user, db=db)
    if membership.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only Owner or Admin can invite team members.",
        )

    if payload.role and payload.role.strip().lower() == "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot invite team member as Owner.",
        )

    clean_email = payload.email.strip().lower()
    assigned_role = payload.role if payload.role in ["admin", "accountant", "viewer"] else "accountant"
    display_name = payload.name.strip() if payload.name and payload.name.strip() else clean_email.split("@")[0]

    # Check if active membership already exists
    existing_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if existing_user:
        existing_mem = (
            db.query(OrganizationMember)
            .filter(OrganizationMember.organization_id == id, OrganizationMember.user_id == existing_user.id)
            .first()
        )
        if existing_mem and existing_mem.status == "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User {clean_email} is already an active member of this organization.",
            )

    inv = Invitation(
        organization_id=id,
        invited_email=clean_email,
        invited_name=display_name,
        invited_role=assigned_role,
        status="pending",
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    return TeamMemberItemResponse(
        id=inv.id,
        user_id=None,
        name=inv.invited_name,
        email=inv.invited_email,
        role=inv.invited_role,
        status="pending",
        is_pending=True,
        created_at=inv.created_at,
    )
