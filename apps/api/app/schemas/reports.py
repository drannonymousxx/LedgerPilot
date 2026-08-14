from datetime import date
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CategorySpendItem(BaseModel):
    category_id: UUID
    category_name: str
    total_cents: int
    transaction_count: int


class DateRange(BaseModel):
    start: Optional[date] = None
    end: Optional[date] = None


class SummaryResponse(BaseModel):
    total_transactions: int
    pending_review_count: int
    approved_count: int
    edited_count: int
    rejected_count: int
    total_spend_cents: int
    total_revenue_cents: int
    spend_by_category: List[CategorySpendItem]
    date_range: DateRange

    model_config = ConfigDict(from_attributes=True)
