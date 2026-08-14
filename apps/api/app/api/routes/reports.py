from datetime import date
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.reports import SummaryResponse
from app.services.reports_service import get_dashboard_summary

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", response_model=SummaryResponse, status_code=status.HTTP_200_OK)
def get_summary_report(
    # TODO: Replace temporary organization_id query parameter with JWT-derived org_id once auth exists.
    organization_id: UUID = Query(..., description="Target Organization ID"),
    start_date: Optional[date] = Query(None, description="Filter transactions from date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter transactions up to date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """
    Get dashboard aggregate metrics (spend, revenue, review counts, category breakdown).
    """
    return get_dashboard_summary(
        db=db,
        organization_id=organization_id,
        start_date=start_date,
        end_date=end_date,
    )
