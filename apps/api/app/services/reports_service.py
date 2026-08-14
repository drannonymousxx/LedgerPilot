from datetime import date
from typing import Optional, List
from uuid import UUID
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.reports import SummaryResponse, CategorySpendItem, DateRange


def get_dashboard_summary(
    db: Session,
    organization_id: UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> SummaryResponse:
    """
    Computes dashboard aggregate metrics for an organization using pure SQL queries.
    Every query filters strictly by organization_id per AGENTS.md Rule #1.
    """
    # Base query filter for organization_id (Rule #1)
    base_tx_query = db.query(Transaction).filter(Transaction.organization_id == organization_id)

    if start_date:
        base_tx_query = base_tx_query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        base_tx_query = base_tx_query.filter(Transaction.transaction_date <= end_date)

    # 1. Total transaction counts by review_status
    total_transactions = base_tx_query.count()

    status_counts_query = (
        db.query(Transaction.review_status, func.count(Transaction.id))
        .filter(Transaction.organization_id == organization_id)
    )
    if start_date:
        status_counts_query = status_counts_query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        status_counts_query = status_counts_query.filter(Transaction.transaction_date <= end_date)

    status_counts = dict(status_counts_query.group_by(Transaction.review_status).all())

    pending_count = status_counts.get("pending", 0)
    approved_count = status_counts.get("approved", 0)
    edited_count = status_counts.get("edited", 0)
    rejected_count = status_counts.get("rejected", 0)

    # 2. Financial totals across human-confirmed transactions (approved or edited)
    confirmed_statuses = ["approved", "edited"]

    spend_query = (
        db.query(func.abs(func.coalesce(func.sum(Transaction.amount_cents), 0)))
        .filter(
            Transaction.organization_id == organization_id,
            Transaction.review_status.in_(confirmed_statuses),
            Transaction.amount_cents < 0,
        )
    )
    if start_date:
        spend_query = spend_query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        spend_query = spend_query.filter(Transaction.transaction_date <= end_date)

    total_spend_cents = spend_query.scalar() or 0

    revenue_query = (
        db.query(func.coalesce(func.sum(Transaction.amount_cents), 0))
        .filter(
            Transaction.organization_id == organization_id,
            Transaction.review_status.in_(confirmed_statuses),
            Transaction.amount_cents > 0,
        )
    )
    if start_date:
        revenue_query = revenue_query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        revenue_query = revenue_query.filter(Transaction.transaction_date <= end_date)

    total_revenue_cents = revenue_query.scalar() or 0

    # 3. Spend breakdown by category (human-confirmed, expense transactions only)
    cat_spend_query = (
        db.query(
            Transaction.final_category_id.label("category_id"),
            Category.name.label("category_name"),
            func.abs(func.sum(Transaction.amount_cents)).label("total_cents"),
            func.count(Transaction.id).label("transaction_count"),
        )
        .join(Category, (Transaction.final_category_id == Category.id) & (Category.organization_id == organization_id))
        .filter(
            Transaction.organization_id == organization_id,
            Transaction.review_status.in_(confirmed_statuses),
            Transaction.amount_cents < 0,
            Transaction.final_category_id.isnot(None),
        )
    )
    if start_date:
        cat_spend_query = cat_spend_query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        cat_spend_query = cat_spend_query.filter(Transaction.transaction_date <= end_date)

    cat_spend_rows = (
        cat_spend_query.group_by(Transaction.final_category_id, Category.name)
        .order_by(func.abs(func.sum(Transaction.amount_cents)).desc())
        .all()
    )

    spend_by_category = [
        CategorySpendItem(
            category_id=row.category_id,
            category_name=row.category_name,
            total_cents=int(row.total_cents),
            transaction_count=int(row.transaction_count),
        )
        for row in cat_spend_rows
    ]

    # 4. Date range determination
    min_date = start_date
    max_date = end_date

    if not min_date or not max_date:
        date_bounds_query = db.query(
            func.min(Transaction.transaction_date),
            func.max(Transaction.transaction_date),
        ).filter(Transaction.organization_id == organization_id)
        if start_date:
            date_bounds_query = date_bounds_query.filter(Transaction.transaction_date >= start_date)
        if end_date:
            date_bounds_query = date_bounds_query.filter(Transaction.transaction_date <= end_date)
        
        db_min_date, db_max_date = date_bounds_query.first()
        min_date = min_date or db_min_date
        max_date = max_date or db_max_date

    return SummaryResponse(
        total_transactions=total_transactions,
        pending_review_count=pending_count,
        approved_count=approved_count,
        edited_count=edited_count,
        rejected_count=rejected_count,
        total_spend_cents=int(total_spend_cents),
        total_revenue_cents=int(total_revenue_cents),
        spend_by_category=spend_by_category,
        date_range=DateRange(start=min_date, end=max_date),
    )
