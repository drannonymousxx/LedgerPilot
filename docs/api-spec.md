# API Spec — LedgerPilot

Follow this exactly. Do not add endpoints not listed here without updating this file first.

## MVP endpoints (build these now)

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/health` | Liveness check | Public |
| POST | `/auth/signup` | Create org + owner user | Public |
| POST | `/auth/login` | Authenticate, return JWT | Public |
| POST | `/transactions/import` | Upload CSV, parse, create raw transactions | Owner |
| GET | `/transactions?status=&category=&page=` | List/filter transactions | Owner |
| GET | `/transactions/{id}` | Get one transaction | Owner |
| PATCH | `/transactions/{id}/review` | Approve/edit/reject AI category suggestion | Owner |
| GET | `/reports/summary?period=` | Dashboard aggregate numbers (computed server-side) | Owner |
| GET | `/audit-logs?entity_type=&entity_id=` | Audit trail | Owner |

## Post-MVP endpoints (designed, not built yet)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/documents` | Upload invoice/receipt |
| GET | `/documents/{id}` | Get extraction result |
| PATCH | `/documents/{id}/review` | Approve/edit extracted fields |
| POST | `/reconciliation/run` | Trigger reconciliation pass |
| GET | `/reconciliation?status=` | List reconciliation results |
| GET | `/anomalies?status=` | List anomalies |
| PATCH | `/anomalies/{id}` | Dismiss/resolve anomaly |
| POST | `/copilot/ask` | Natural-language finance question |

## Conventions
- All request/response bodies typed via Pydantic schemas in `apps/api/app/schemas/`.
- All list endpoints support pagination (`page`, `page_size`) and return `{items, total, page, page_size}`.
- All error responses follow `{detail: string}` (FastAPI default) — don't invent a custom error shape.
- Every route handler must scope its query by `organization_id` derived from the authenticated user's JWT, never from a client-supplied parameter.
