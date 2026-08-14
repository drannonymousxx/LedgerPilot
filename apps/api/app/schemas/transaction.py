from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class RowError(BaseModel):
    row: int
    reason: str


class CSVImportResponse(BaseModel):
    imported_count: int
    skipped_count: int
    errors: List[RowError]


class TransactionResponse(BaseModel):
    id: UUID
    organization_id: UUID
    vendor_id: Optional[UUID] = None
    vendor_raw: Optional[str] = None
    amount_cents: int
    currency: str
    transaction_date: date
    description: Optional[str] = None
    ai_suggested_category_id: Optional[UUID] = None
    ai_confidence: Optional[Decimal] = None
    final_category_id: Optional[UUID] = None
    review_status: str
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    source: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedTransactionsResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
