import csv
import io
import re
from datetime import datetime, date
from decimal import Decimal, InvalidOperation
from typing import Tuple, Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.schemas.transaction import CSVImportResponse, RowError


def normalize_vendor_name(raw_name: str) -> str:
    """
    Normalizes a vendor string by converting to lowercase and stripping whitespace and punctuation.
    """
    # Remove punctuation (keep alphanumeric characters and whitespace)
    cleaned = re.sub(r"[^\w\s]", "", raw_name)
    # Collapse multiple spaces and strip
    normalized = re.sub(r"\s+", " ", cleaned).strip().lower()
    return normalized if normalized else raw_name.strip().lower()


def parse_date(date_str: str) -> Optional[date]:
    """
    Parses date string into a datetime.date object. Supports YYYY-MM-DD, MM/DD/YYYY, YYYY/MM/DD.
    """
    date_str = date_str.strip()
    formats = ["%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d", "%d-%m-%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def parse_amount_cents(amount_str: str) -> Optional[int]:
    """
    Parses dollar amount string into integer cents. Negative for expenses.
    """
    cleaned_str = amount_str.replace("$", "").replace(",", "").strip()
    if not cleaned_str:
        return None
    try:
        val = Decimal(cleaned_str)
        return int(round(val * 100))
    except (InvalidOperation, TypeError, ValueError):
        return None


def import_transactions_csv(
    db: Session, file_content: bytes, organization_id: UUID
) -> Tuple[CSVImportResponse, List[UUID]]:
    """
    Parses an uploaded CSV, normalizes vendors, creates pending transactions,
    logs skipped row errors, and writes one audit log entry for the batch.
    Returns a tuple of (CSVImportResponse, imported_transaction_ids).
    """
    # Decode bytes content into text
    text_content = file_content.decode("utf-8-sig")
    csv_reader = csv.reader(io.StringIO(text_content))

    headers = None
    imported_count = 0
    skipped_count = 0
    errors: List[RowError] = []
    imported_transaction_ids: List[UUID] = []

    # Map column headers to index
    header_indices = {}

    for row_idx, row in enumerate(csv_reader, start=1):
        if not row or not any(field.strip() for field in row):
            continue

        if headers is None:
            # Parse header row
            headers = [h.strip().lower() for h in row]
            for idx, h in enumerate(headers):
                if h in ("vendor", "vendor_raw", "payee", "merchant"):
                    header_indices["vendor"] = idx
                elif h in ("amount", "amount_cents"):
                    header_indices["amount"] = idx
                elif h in ("date", "transaction_date"):
                    header_indices["date"] = idx
                elif h in ("description", "memo", "notes"):
                    header_indices["description"] = idx
            continue

        # Extract values based on header indices
        vendor_raw = (
            row[header_indices["vendor"]].strip()
            if "vendor" in header_indices and len(row) > header_indices["vendor"]
            else ""
        )
        amount_raw = (
            row[header_indices["amount"]].strip()
            if "amount" in header_indices and len(row) > header_indices["amount"]
            else ""
        )
        date_raw = (
            row[header_indices["date"]].strip()
            if "date" in header_indices and len(row) > header_indices["date"]
            else ""
        )
        description_raw = (
            row[header_indices["description"]].strip()
            if "description" in header_indices and len(row) > header_indices["description"]
            else None
        )

        # Validate Vendor
        if not vendor_raw:
            skipped_count += 1
            errors.append(RowError(row=row_idx, reason="Missing vendor name"))
            continue

        # Validate Amount
        amount_cents = parse_amount_cents(amount_raw)
        if amount_cents is None:
            skipped_count += 1
            errors.append(
                RowError(row=row_idx, reason=f"Invalid or missing amount: '{amount_raw}'")
            )
            continue

        # Validate Date
        transaction_date = parse_date(date_raw)
        if transaction_date is None:
            skipped_count += 1
            errors.append(
                RowError(row=row_idx, reason=f"Invalid or missing date: '{date_raw}'")
            )
            continue

        # Find or create Vendor
        normalized_vendor = normalize_vendor_name(vendor_raw)
        vendor = (
            db.query(Vendor)
            .filter(
                Vendor.organization_id == organization_id,
                Vendor.normalized_name == normalized_vendor,
            )
            .first()
        )

        if not vendor:
            vendor = Vendor(
                organization_id=organization_id,
                name=vendor_raw,
                normalized_name=normalized_vendor,
            )
            db.add(vendor)
            db.flush()

        # Create Transaction
        transaction = Transaction(
            organization_id=organization_id,
            vendor_id=vendor.id,
            vendor_raw=vendor_raw,
            amount_cents=amount_cents,
            currency="USD",
            transaction_date=transaction_date,
            description=description_raw,
            ai_suggested_category_id=None,
            ai_confidence=None,
            final_category_id=None,
            review_status="pending",
            source="csv_import",
        )
        db.add(transaction)
        db.flush()
        imported_transaction_ids.append(transaction.id)
        imported_count += 1

    # Write ONE audit log entry for the batch import
    audit_log = AuditLog(
        organization_id=organization_id,
        user_id=None,
        action="transaction.imported",
        entity_type="transaction",
        entity_id=None,
        before_value=None,
        after_value={
            "imported_count": imported_count,
            "skipped_count": skipped_count,
        },
    )
    db.add(audit_log)
    db.commit()

    response = CSVImportResponse(
        imported_count=imported_count,
        skipped_count=skipped_count,
        errors=errors,
    )
    return response, imported_transaction_ids
