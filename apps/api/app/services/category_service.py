from typing import List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.category import Category

STARTER_CATEGORIES = [
    "Software / Cloud",
    "Travel",
    "Meals & Entertainment",
    "Office Supplies",
    "Professional Services",
    "Marketing",
    "Payroll",
    "Revenue",
    "Other",
]


def seed_default_categories(db: Session, organization_id: UUID) -> List[Category]:
    """
    Inserts starter categories for an organization if none exist yet.
    """
    existing = db.query(Category).filter(Category.organization_id == organization_id).all()
    if existing:
        return existing

    new_categories = []
    for cat_name in STARTER_CATEGORIES:
        category = Category(
            organization_id=organization_id,
            name=cat_name,
        )
        db.add(category)
        new_categories.append(category)

    db.commit()

    return db.query(Category).filter(Category.organization_id == organization_id).all()


def get_org_categories(db: Session, organization_id: UUID) -> List[Category]:
    """
    Retrieves allowed categories for an organization. Seeds defaults if none exist.
    """
    categories = db.query(Category).filter(Category.organization_id == organization_id).all()
    if not categories:
        categories = seed_default_categories(db, organization_id)
    return categories
