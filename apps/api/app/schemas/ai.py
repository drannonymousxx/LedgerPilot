from typing import List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class TransactionCategoryItem(BaseModel):
    transaction_id: UUID
    category_name: str = Field(..., description="Category name from the allowed closed category list")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    reasoning: str = Field(..., description="Brief reasoning for the categorization suggestion")

    model_config = ConfigDict(extra="ignore")


class CategorizationBatchResponse(BaseModel):
    items: List[TransactionCategoryItem]

    model_config = ConfigDict(extra="ignore")
