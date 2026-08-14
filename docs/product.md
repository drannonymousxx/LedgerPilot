# Product Spec — LedgerPilot

## Problem
Startups and bookkeeping teams spend significant manual effort reading invoices, categorizing transactions, matching bank activity to invoices, and answering repetitive financial questions. LedgerPilot uses AI to do the first pass on this work while keeping a human in control of every decision.

## Core philosophy
**AI suggests → system validates → human approves → system records → everything is auditable.**

## Users
- **Founder-operator**: non-finance background, wants monthly numbers without manual reconciliation, trusts AI suggestions but wants final say.
- **Bookkeeper**: manages books for multiple startup clients, needs speed and a defensible audit trail.

## MVP scope (build this first, nothing else)
1. CSV transaction import
2. AI categorization with confidence scores
3. Human review/approval queue (accept / edit / reject)
4. Dashboard with real aggregate numbers (computed from DB, not LLM)
5. Audit log (data model only at MVP; UI page can come later)

## Explicitly deferred (designed, not built yet)
- Document/invoice upload + extraction
- Reconciliation engine (transaction ↔ invoice matching)
- AI copilot (conversational Q&A)
- Anomaly detection
- QuickBooks / Zoho integrations
- Multi-user roles / permissions beyond single owner

## Core user journey (MVP)
1. User uploads `transactions.csv`.
2. Backend parses rows → stores raw `transactions`.
3. Background job sends transactions to LLM in batches → returns category + confidence per row.
4. User reviews AI suggestions in a queue: sees vendor, amount, AI category, confidence badge; approves, edits, or rejects.
5. Approved transactions feed into dashboard aggregates (spend by category, spend by month, pending review count).
6. Every review decision writes an audit log entry.

## Non-goals for this project
- Real financial credentials or production data — synthetic/demo data only.
- Enterprise-grade multi-tenancy, SSO, or granular RBAC.
- ML-based anomaly detection at MVP — rule-based only, explainable.
