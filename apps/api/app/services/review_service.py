import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.vendor import Vendor
from app.models.category import Category
from app.models.user import User
from app.models.organization_member import OrganizationMember
from app.models.audit_log import AuditLog
from app.schemas.transaction import TransactionReviewRequest


logger = logging.getLogger(__name__)


def review_transaction(
    db: Session,
    organization_id: UUID,
    transaction_id: UUID,
    payload: TransactionReviewRequest,
    # TODO: Replace temporary reviewer_user_id with JWT-derived user_id once auth exists.
    reviewer_user_id: Optional[UUID] = None,
) -> Transaction:
    """
    Approve, edit, or reject an AI-suggested transaction categorization.
    Updates transaction, sets vendor default_category on edit, and writes an audit log.
    """
    # 1. Fetch transaction scoped strictly by organization_id (Rule #1)
    tx = (
        db.query(Transaction)
        .filter(
            Transaction.organization_id == organization_id,
            Transaction.id == transaction_id,
        )
        .first()
    )

    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    # TODO: Use authenticated user_id once auth is implemented.
    active_user_id = reviewer_user_id or payload.user_id

    # Verify user exists in organization if user_id was supplied (to respect foreign key)
    valid_user_id = None
    if active_user_id:
        member_obj = (
            db.query(OrganizationMember)
            .filter(
                OrganizationMember.organization_id == organization_id,
                OrganizationMember.user_id == active_user_id,
            )
            .first()
        )
        if member_obj:
            valid_user_id = active_user_id
        else:
            logger.info(f"User ID {active_user_id} not found in organization members. Storing None for user_id.")


    # Capture state before modification for audit log
    before_value = {
        "review_status": tx.review_status,
        "final_category_id": str(tx.final_category_id) if tx.final_category_id else None,
        "ai_suggested_category_id": str(tx.ai_suggested_category_id) if tx.ai_suggested_category_id else None,
        "reviewed_by": str(tx.reviewed_by) if tx.reviewed_by else None,
        "reviewed_at": tx.reviewed_at.isoformat() if tx.reviewed_at else None,
    }

    action_lower = payload.action.strip().lower()

    if action_lower == "approve":
        # Target category is payload.category_id if specified, else ai_suggested_category_id
        target_category_id = payload.category_id or tx.ai_suggested_category_id

        if not target_category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot approve transaction without an AI suggested category or a specified category_id",
            )

        # Validate category belongs to organization (Rule #1)
        cat = (
            db.query(Category)
            .filter(
                Category.organization_id == organization_id,
                Category.id == target_category_id,
            )
            .first()
        )
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specified category does not exist for this organization",
            )

        tx.final_category_id = target_category_id
        tx.review_status = "approved"
        tx.reviewed_by = valid_user_id
        tx.reviewed_at = datetime.now(timezone.utc)
        audit_action = "transaction.approved"

    elif action_lower == "edit":
        if not payload.category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="category_id is required when action is 'edit'",
            )

        # Validate category belongs to organization (Rule #1)
        cat = (
            db.query(Category)
            .filter(
                Category.organization_id == organization_id,
                Category.id == payload.category_id,
            )
            .first()
        )
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Specified category does not exist for this organization",
            )

        tx.final_category_id = payload.category_id
        tx.review_status = "edited"
        tx.reviewed_by = valid_user_id
        tx.reviewed_at = datetime.now(timezone.utc)
        audit_action = "transaction.edited"

        # Update matched Vendor default_category_id on edit
        if tx.vendor_id:
            vendor = (
                db.query(Vendor)
                .filter(
                    Vendor.organization_id == organization_id,
                    Vendor.id == tx.vendor_id,
                )
                .first()
            )
            if vendor:
                vendor.default_category_id = payload.category_id

    elif action_lower == "reject":
        tx.final_category_id = None
        tx.review_status = "rejected"
        tx.reviewed_by = valid_user_id
        tx.reviewed_at = datetime.now(timezone.utc)
        audit_action = "transaction.rejected"

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action '{payload.action}'. Must be 'approve', 'edit', or 'reject'.",
        )

    # Capture state after modification for audit log
    after_value = {
        "review_status": tx.review_status,
        "final_category_id": str(tx.final_category_id) if tx.final_category_id else None,
        "reviewed_by": str(tx.reviewed_by) if tx.reviewed_by else None,
        "reviewed_at": tx.reviewed_at.isoformat() if tx.reviewed_at else None,
    }

    # Write AuditLog record per Rule #7
    audit_log = AuditLog(
        organization_id=organization_id,
        user_id=valid_user_id,
        action=audit_action,
        entity_type="transaction",
        entity_id=tx.id,
        before_value=before_value,
        after_value=after_value,
    )
    db.add(audit_log)

    db.commit()
    db.refresh(tx)
    return tx
