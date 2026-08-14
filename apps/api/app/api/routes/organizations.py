from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.organization import Organization
from app.services.category_service import seed_default_categories, get_org_categories

router = APIRouter(prefix="/organizations", tags=["organizations"])


class CategoryResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


@router.post("/{id}/seed-categories", response_model=List[CategoryResponse], status_code=status.HTTP_200_OK)
def seed_categories(id: UUID, db: Session = Depends(get_db)):
    """
    Dev-only endpoint to seed starter categories for an organization if none exist yet.
    """
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    categories = seed_default_categories(db=db, organization_id=id)
    return categories


@router.get("/{id}/categories", response_model=List[CategoryResponse], status_code=status.HTTP_200_OK)
def get_categories(id: UUID, db: Session = Depends(get_db)):
    """
    Get all categories for an organization (seeds starter list if empty).
    """
    org = db.query(Organization).filter(Organization.id == id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    categories = get_org_categories(db=db, organization_id=id)
    return categories
