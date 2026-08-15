from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, get_current_org_membership
from app.models.user import User
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
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
    role: str = "member"

    model_config = ConfigDict(from_attributes=True)


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
