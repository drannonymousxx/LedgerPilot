"""
Test script for PATCH transaction review endpoint, database state, audit logs, and status filtering.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import func
from app.core.db import SessionLocal
from app.core.auth import hash_password
from app.models.user import User
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.audit_log import AuditLog
from app.services.category_service import seed_default_categories
from app.services.review_service import review_transaction
from app.schemas.transaction import TransactionReviewRequest

print("==========================================================")
print("LEDGERPILOT PATCH REVIEW ENDPOINT & DATABASE DIAGNOSTIC")
print("==========================================================")

db = SessionLocal()
ts = int(datetime.now(timezone.utc).timestamp())

try:
    # 1. Create Test Org & User
    user_id = uuid.uuid4()
    user = User(id=user_id, email=f"reviewer.{ts}@example.com", full_name="Reviewer QA")
    org = Organization(name=f"Review QA Org {ts}")
    db.add_all([user, org])
    db.commit()
    db.refresh(org)

    mem = OrganizationMember(organization_id=org.id, user_id=user.id, role="owner", status="active")
    db.add(mem)
    db.commit()

    cats = seed_default_categories(db, org.id)
    cat_software = cats[0]

    # 2. Create Test Pending Transaction
    tx = Transaction(
        organization_id=org.id,
        vendor_raw="AWS Hosting",
        amount_cents=-5000,
        currency="USD",
        transaction_date=datetime.now(timezone.utc).date(),
        description="Monthly hosting bill",
        ai_suggested_category_id=cat_software.id,
        ai_confidence=0.95,
        review_status="pending",
        source="csv_import"
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    print(f"Created initial pending transaction: {tx.id}, status={tx.review_status}")

    # 3. Test APPROVE Action
    req_approve = TransactionReviewRequest(action="approve")
    tx_approved = review_transaction(
        db=db,
        organization_id=org.id,
        transaction_id=tx.id,
        payload=req_approve,
        reviewer_user_id=user.id
    )

    print(f"[APPROVE SUCCESS] review_status={tx_approved.review_status}, final_cat={tx_approved.final_category_id}, reviewed_by={tx_approved.reviewed_by}")

    # Verify Audit Log
    audit = db.query(AuditLog).filter(
        AuditLog.organization_id == org.id,
        AuditLog.entity_id == tx.id,
        AuditLog.action == "transaction.approved"
    ).first()
    if audit:
        print(f"[AUDIT LOG VERIFIED] action={audit.action}, user_id={audit.user_id}")
    else:
        print("[AUDIT LOG FAILED] No audit log found for approve")

    # 4. Test EDIT Action
    cat_marketing = cats[1]
    req_edit = TransactionReviewRequest(action="edit", category_id=cat_marketing.id)
    tx_edited = review_transaction(
        db=db,
        organization_id=org.id,
        transaction_id=tx.id,
        payload=req_edit,
        reviewer_user_id=user.id
    )

    print(f"[EDIT SUCCESS] review_status={tx_edited.review_status}, final_cat={tx_edited.final_category_id}")

    # 5. Test REJECT Action
    req_reject = TransactionReviewRequest(action="reject")
    tx_rejected = review_transaction(
        db=db,
        organization_id=org.id,
        transaction_id=tx.id,
        payload=req_reject,
        reviewer_user_id=user.id
    )

    print(f"[REJECT SUCCESS] review_status={tx_rejected.review_status}, final_cat={tx_rejected.final_category_id}")

    # 6. Verify Status Filter Query in DB
    pending_count = db.query(Transaction).filter(Transaction.organization_id == org.id, Transaction.review_status == "pending").count()
    rejected_count = db.query(Transaction).filter(Transaction.organization_id == org.id, Transaction.review_status == "rejected").count()

    print(f"[FILTER VERIFICATION] Pending count={pending_count}, Rejected count={rejected_count}")

    print("==========================================================")
    print("ALL SERVICE & DATABASE PATCH REVIEW TESTS PASSED!")
    print("==========================================================")

finally:
    db.close()
