from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.db import get_db, SessionLocal
from app.models.organization import Organization
from app.models.transaction import Transaction
from app.schemas.transaction import CSVImportResponse, PaginatedTransactionsResponse, TransactionResponse
from app.services.csv_import_service import import_transactions_csv
from app.services.categorization_service import categorize_transactions

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
    file: UploadFile = File(...),
    # TODO: Replace temporary organization_id query parameter with JWT-derived org_id once auth exists.
    organization_id: UUID = Query(..., description="Target Organization ID"),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported",
        )

    # Verify organization exists
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
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
    # TODO: Replace temporary organization_id query parameter with JWT-derived org_id once auth exists.
    organization_id: UUID = Query(..., description="Target Organization ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by review status (pending/approved/rejected)"),
    category_id: Optional[UUID] = Query(None, description="Filter by category ID"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """
    List and filter transactions for an organization with pagination.
    """
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
