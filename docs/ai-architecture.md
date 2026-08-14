# AI Architecture — LedgerPilot

## Core rule
**The LLM never computes or invents financial numbers.** It categorizes, extracts fields, explains results, or routes questions to backend queries. All math (sums, averages, trends) happens in SQL/Python.

## Categorization pipeline (MVP — build this first)
```
batch of transactions (vendor_raw, amount_cents, description)
  → prompt with a FIXED, closed category list (never let the model invent categories)
  → Google Gemini structured/schema-constrained output:
      {transaction_id, category, confidence, reasoning}
  → Pydantic validation server-side:
      - category must be in the allowed set for this org, else reject
      - confidence must be 0.0–1.0
  → on validation failure: one retry with an explicit correction prompt
  → on second failure: store review_status='pending', ai_confidence=0 — never guess
  → store ai_suggested_category_id + ai_confidence on the transaction row
  → human reviews via PATCH /transactions/{id}/review
  → on approval: final_category_id set, review_status updated, audit_logs row written
```

## Confidence scoring
Derive from two signals, not the LLM's self-reported number alone:
1. LLM's own reported confidence (0–1).
2. Deterministic boost/penalty: if `vendor_id` already has a `default_category_id` matching the suggestion → boost; if this is a brand-new vendor with no history → no boost, rely on LLM confidence as-is.

## Document extraction pipeline (post-MVP, designed only)
```
PDF/image → text extraction → prompt with a fixed JSON schema (vendor, amount, currency, date, tax, category)
  → structured output → Pydantic validation → confidence score
  → store ai_extracted_json (full raw output, for audit) + ai_confidence on invoices row
  → human review UI (side-by-side original doc + extracted fields) → approval → creates invoice record
```

## Copilot pipeline (post-MVP, designed only — two-call architecture, do not collapse into one call)
```
user question
  → LLM call #1 (intent classification ONLY): picks one tool from a fixed list + extracts params
      tools: get_expense_summary(period, group_by) | get_unmatched_transactions()
             | get_vendor_spend_trend(vendor, periods) | get_anomalies(status)
  → backend executes the matching SQL query deterministically
  → LLM call #2 (explanation ONLY): given the query results, explain in plain language
      — instructed to cite only the numbers provided, never introduce new figures
  → response returns both the raw numbers (for UI charts) and the explanation text
```

## Anomaly detection (post-MVP, rule-based, no ML at this stage)
- Large amount: transaction > mean + 3×stddev for that vendor/category, trailing 90 days.
- Duplicate: same vendor + amount + date within N days.
- New vendor: first transaction above a threshold amount for a never-seen vendor.
- No supporting document: transaction unmatched to any invoice after N days.

Each rule must be a pure, unit-testable function with fixed input/output fixtures.

## LLM client contract
All LLM calls go through `apps/api/app/ai/llm_client.py` — no route handler or service calls the Google Gemini SDK directly. This keeps prompts, retries, and validation centralized and testable, and keeps the provider swappable.
