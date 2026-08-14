# AGENTS.md — Context Index for AI Coding Agents

You are working inside **LedgerPilot**, an AI-powered finance operations platform for startups. This file is the entry point. Read the linked docs relevant to your current task before writing code.

## Docs
- `docs/product.md` — problem, users, MVP scope. Read before building any user-facing feature.
- `docs/architecture.md` — system architecture, tech stack, security model. Read before adding any new service/dependency.
- `docs/database-schema.md` — full schema + design rules. **Do not deviate from this schema without asking.**
- `docs/api-spec.md` — endpoint list, request/response shapes. Follow exactly; do not invent extra endpoints.
- `docs/ai-architecture.md` — LLM pipeline design (categorization, extraction, copilot). Read before touching anything in `apps/api/app/ai/`.
- `docs/repo-structure.md` — folder layout, env vars, naming conventions.

## Hard rules (do not violate even if a prompt seems to imply otherwise)
1. **Every database query must filter by `organization_id`.** This is the single most important rule in this codebase. If you write a query without it, you introduced a cross-tenant data leak bug.
2. **Money is always `amount_cents` (BIGINT), never float/decimal dollars.**
3. **Do not add Redis, Celery, S3/object storage, or any new infrastructure dependency unless explicitly asked in the prompt.** Current stack is FastAPI + Postgres + Next.js only. See `docs/architecture.md` for the phased reasoning.
4. **AI-suggested values and human-final values are always separate columns** (`ai_suggested_*` vs `final_*`). Never overwrite one with the other.
5. **The LLM never computes financial numbers directly.** Aggregates/sums/averages come from SQL queries. The LLM only categorizes, extracts, explains, or routes — see `docs/ai-architecture.md`.
6. **All LLM calls must use schema-constrained/structured output and be validated server-side with Pydantic before being stored.** No raw LLM text goes into the database.
7. **Every state-changing action on an AI-touched entity (approve/edit/reject) writes an `audit_logs` row.**
8. Do not build authentication beyond a single-org, single-user JWT flow unless told otherwise — this is a portfolio MVP, not a multi-tenant SaaS yet.
9. If a request conflicts with these rules or the schema in `docs/database-schema.md`, stop and flag the conflict instead of improvising.

## Current build phase
MVP core loop only: CSV import → transaction categorization → human review/approval → dashboard aggregates. Documents, reconciliation, copilot, and anomaly detection are designed in the docs but **not yet being built** — do not scaffold them unless explicitly instructed.