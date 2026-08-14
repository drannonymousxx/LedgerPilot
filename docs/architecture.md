# Architecture — LedgerPilot

## Tech stack (current phase — do not add beyond this without explicit instruction)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind | |
| Backend | Python + FastAPI | Business logic, LLM orchestration |
| Database | PostgreSQL (via SQLAlchemy + Alembic migrations) | System of record |
| AI | Anthropic API | Wrapped behind `apps/api/app/ai/llm_client.py`, never called directly from route handlers |
| Background jobs | FastAPI `BackgroundTasks` | Upgrade to Celery + Redis only when a real feature (e.g. large-batch reconciliation) needs retryable/observable jobs — not before |
| Local dev | docker-compose (Postgres only) | |
| Deployment target | Vercel (frontend) + Railway/Render (API + Postgres) | Not set up yet at MVP scaffolding stage |

**Explicitly not used yet:** Redis, Celery, object storage (S3/Supabase Storage), OAuth integrations. These are real Phase 3+ additions, sequenced deliberately, not omissions.

## System diagram
```
Next.js (web) ──REST──> FastAPI (api) ──> PostgreSQL
                              │
                              └──> Anthropic API (structured/schema-constrained calls only)
```

## Data flow — the core AI loop pattern (reused for every AI-touched feature)
```
raw input → validation → LLM call (schema-constrained output)
  → Pydantic server-side validation → confidence score
  → store as review_status = 'pending'
  → human review UI → human decision
  → store final_* value + review_status update → write audit_logs row
  → reflected in aggregate queries / dashboard
```

## Security model (MVP-appropriate)
- Single JWT-based auth, one `organization_id` per user for now.
- **Every table with financial data has `organization_id`; every query must filter by it.** This is enforced by convention, not by RLS at this stage — code review is the safety net, so agents must never skip it.
- Uploaded files (when documents feature is built) validated for MIME type and size before processing.
- Secrets via `.env`, never committed. `.env.example` is the only committed env file.
- LLM calls only ever see synthetic/demo data — never real credentials or PII beyond what's in the seeded dataset.

## Money representation
All monetary values stored as `amount_cents` (BIGINT). Never use FLOAT/DECIMAL dollars in code or schema. Convert to display currency only at the frontend formatting layer.

## AI call contract (applies to every LLM integration point)
1. Prompt requests a fixed JSON schema (via Anthropic tool-use/structured output), not free text.
2. Response is parsed and re-validated with a Pydantic model server-side — schema-constrained output is not trusted blindly.
3. On validation failure: one retry with an explicit correction prompt. Second failure → store with `review_status = 'pending'`, confidence `0`, never silently accept or guess.
4. Aggregation/math (sums, averages, trends) is always computed by SQL/Python, never returned directly by the LLM as a number to display.
