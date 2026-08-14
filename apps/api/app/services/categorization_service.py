import logging
from typing import List, Dict, Optional, Set
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.vendor import Vendor
from app.models.category import Category
from app.services.category_service import get_org_categories
from app.schemas.ai import CategorizationBatchResponse, TransactionCategoryItem
from app.ai.llm_client import llm_client

logger = logging.getLogger(__name__)


def categorize_transactions(
    db: Session, organization_id: UUID, transaction_ids: List[UUID]
) -> None:
    """
    Batched transaction categorization using structured LLM output with retry handling & confidence boosting.
    Fails closed (ai_suggested_category_id=None, ai_confidence=0.0) if GEMINI_API_KEY is not configured
    or if LLM calls / schema validations fail.
    """
    if not transaction_ids:
        return

    # 1. Fetch transactions for this organization (Rule #1)
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.organization_id == organization_id,
            Transaction.id.in_(transaction_ids),
        )
        .all()
    )

    if not transactions:
        return

    # 2. Fetch allowed categories for this organization
    categories = get_org_categories(db, organization_id)
    allowed_name_map: Dict[str, Category] = {c.name.lower(): c for c in categories}
    allowed_category_names = [c.name for c in categories]

    # Pre-fetch vendors for default_category checking
    vendor_ids = {t.vendor_id for t in transactions if t.vendor_id}
    vendors = (
        db.query(Vendor)
        .filter(Vendor.organization_id == organization_id, Vendor.id.in_(vendor_ids))
        .all()
        if vendor_ids
        else []
    )
    vendor_map = {v.id: v for v in vendors}

    # Process in batches of 15
    batch_size = 15
    for i in range(0, len(transactions), batch_size):
        batch = transactions[i : i + batch_size]
        
        # Check if LLM client has API key configured
        use_llm = bool(llm_client.api_key and llm_client.client)

        llm_results: Dict[UUID, TransactionCategoryItem] = {}

        if use_llm:
            prompt_lines = [
                "Categorize the following financial transactions.",
                f"Allowed categories (MUST pick strictly from this list): {', '.join(allowed_category_names)}",
                "",
                "Transactions to categorize:",
            ]
            for tx in batch:
                prompt_lines.append(
                    f"- ID: {tx.id} | Vendor: {tx.vendor_raw} | Amount Cents: {tx.amount_cents} | Description: {tx.description or 'N/A'}"
                )

            prompt = "\n".join(prompt_lines)

            # Try LLM call up to 2 times (1 retry on validation failure)
            for attempt in range(2):
                try:
                    current_prompt = prompt
                    if attempt == 1:
                        current_prompt += "\n\nCORRECTION: One or more previous category suggestions were not in the allowed category list or had invalid confidence. Ensure category_name is an EXACT match from the allowed list."

                    response = llm_client.generate_structured_output(
                        prompt=current_prompt,
                        response_model=CategorizationBatchResponse,
                    )

                    # Validate response items against allowed categories
                    valid = True
                    item_dict = {}
                    for item in response.items:
                        if item.category_name.lower() not in allowed_name_map:
                            valid = False
                            break
                        if not (0.0 <= item.confidence <= 1.0):
                            valid = False
                            break
                        item_dict[item.transaction_id] = item

                    if valid:
                        llm_results = item_dict
                        break
                except Exception as e:
                    logger.warning(f"Categorization LLM call attempt {attempt + 1} failed: {e}")
                    continue
        else:
            logger.warning("GEMINI_API_KEY is not configured. Categorization will fail closed.")

        # Update transactions with categorization suggestions or fail closed
        for tx in batch:
            suggested_cat_name = None
            reported_confidence = 0.0

            if tx.id in llm_results:
                item = llm_results[tx.id]
                suggested_cat_name = item.category_name
                reported_confidence = item.confidence

            cat_obj = allowed_name_map.get(suggested_cat_name.lower()) if suggested_cat_name else None

            if cat_obj and reported_confidence > 0.0:
                # Calculate confidence boost if vendor has a matching default_category_id
                vendor = vendor_map.get(tx.vendor_id) if tx.vendor_id else None
                final_conf = reported_confidence
                if vendor and vendor.default_category_id and vendor.default_category_id == cat_obj.id:
                    final_conf = min(1.0, round(reported_confidence + 0.15, 3))

                tx.ai_suggested_category_id = cat_obj.id
                tx.ai_confidence = final_conf
            else:
                # Fail closed: no category assigned, confidence 0.0
                tx.ai_suggested_category_id = None
                tx.ai_confidence = 0.0

            # Always keep review_status pending and final_category_id None
            tx.review_status = "pending"
            tx.final_category_id = None

        db.commit()
