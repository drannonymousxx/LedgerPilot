from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.db import get_db, SessionLocal
from app.core.auth import get_current_user, get_current_org_membership
from app.models.user import User
from app.models.organization import Organization
from app.models.transaction import Transaction
from app.schemas.transaction import (
    CSVImportResponse,
    PaginatedTransactionsResponse,
    TransactionResponse,
    TransactionReviewRequest,
)
from app.services.csv_import_service import import_transactions_csv
from app.services.categorization_service import categorize_transactions
from app.services.review_service import review_transaction

router = APIRouter(prefix="/transactions", tags=["transactions"])


def run_background_categorization(organization_id: UUID, transaction_ids: List[UUID]):
    """
    Background worker function for transaction categorization.
    Creates a dedicated DB session.
    """
    db = SessionLocal()
    try:
        categorize_transactions(db=db, organization_id=organization_id, transaction_ids=transaction_ids)
    finally:
        db.close()


@router.post("/import", response_model=CSVImportResponse, status_code=status.HTTP_200_OK)
async def import_transactions(
    background_tasks: BackgroundTasks,
    organization_id: UUID = Query(..., description="Target Organization ID"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Enforce authentication & organization membership authorization
    membership = get_current_org_membership(organization_id=organization_id, current_user=current_user, db=db)
    if membership.role == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role 'viewer' does not have permission to import transactions",
        )

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported",
        )

    content = await file.read()
    import_response, imported_ids = import_transactions_csv(
        db=db, file_content=content, organization_id=organization_id
    )

    # Trigger async background categorization for imported transactions
    if imported_ids:
        background_tasks.add_task(
            run_background_categorization, organization_id, imported_ids
        )

    return import_response


@router.get("", response_model=PaginatedTransactionsResponse, status_code=status.HTTP_200_OK)
def list_transactions(
    organization_id: UUID = Query(..., description="Target Organization ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by review status (pending/approved/edited/rejected)"),
    category_id: Optional[UUID] = Query(None, description="Filter by category ID"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List and filter transactions for an organization with pagination.
    Requires authentication and organization membership.
    """
    # Enforce organization membership authorization (Rule #1 & Rule #14)
    get_current_org_membership(organization_id=organization_id, current_user=current_user, db=db)

    # Base query MUST filter by organization_id (Rule #1)
    query = db.query(Transaction).filter(Transaction.organization_id == organization_id)

    if status_filter:
        query = query.filter(Transaction.review_status == status_filter)

    if category_id:
        query = query.filter(
            (Transaction.final_category_id == category_id) | 
            (Transaction.ai_suggested_category_id == category_id)
        )

    total = query.count()

    offset = (page - 1) * page_size
    items = (
        query.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return PaginatedTransactionsResponse(
        items=[TransactionResponse.model_validate(tx) for tx in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch("/{id}/review", response_model=TransactionResponse, status_code=status.HTTP_200_OK)
def review_transaction_endpoint(
    id: UUID,
    payload: TransactionReviewRequest,
    organization_id: UUID = Query(..., description="Target Organization ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Approve, edit, or reject an AI-suggested transaction categorization.
    Requires active organization membership with review privileges.
    """
    membership = get_current_org_membership(organization_id=organization_id, current_user=current_user, db=db)
    if membership.role == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role 'viewer' does not have permission to review transactions",
        )

    return review_transaction(
        db=db,
        organization_id=organization_id,
        transaction_id=id,
        payload=payload,
        reviewer_user_id=current_user.id,
    )
