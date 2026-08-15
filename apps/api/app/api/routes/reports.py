from datetime import date
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import get_current_user, get_current_org_membership
from app.models.user import User
from app.schemas.reports import SummaryResponse
from app.services.reports_service import get_dashboard_summary

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", response_model=SummaryResponse, status_code=status.HTTP_200_OK)
def get_summary_report(
    organization_id: UUID = Query(..., description="Target Organization ID"),
    start_date: Optional[date] = Query(None, description="Filter transactions from date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter transactions up to date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get dashboard aggregate metrics (spend, revenue, review counts, category breakdown).
    Requires authentication and organization membership verification.
    """
    # Enforce organization membership authorization (Rule #1 & Rule #14)
    get_current_org_membership(organization_id=organization_id, current_user=current_user, db=db)

    return get_dashboard_summary(
        db=db,
        organization_id=organization_id,
        start_date=start_date,
        end_date=end_date,
    )
