# Repo Structure & Conventions — LedgerPilot

```
ledgerpilot/
├── AGENTS.md                 # agent entry point — read first
├── docs/
│   ├── product.md
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-spec.md
│   └── ai-architecture.md
├── apps/
│   ├── web/                  # Next.js frontend
│   │   ├── app/
│   │   │   ├── (marketing)/  # home, pricing — build LAST
│   │   │   ├── (auth)/       # login, signup
│   │   │   └── (dashboard)/  # transactions, reports, etc. — build FIRST
│   │   ├── components/
│   │   └── lib/               # API client, generated types
│   └── api/                  # FastAPI backend
│       ├── app/
│       │   ├── main.py
│       │   ├── core/          # config.py, db.py, security.py
│       │   ├── models/        # SQLAlchemy models — must match docs/database-schema.md exactly
│       │   ├── schemas/       # Pydantic request/response + LLM output contracts
│       │   ├── api/routes/    # one file per resource: transactions.py, auth.py, reports.py
│       │   ├── services/      # business logic, e.g. categorization_service.py
│       │   └── ai/            # llm_client.py, prompts/, validators.py
│       ├── alembic/
│       └── tests/
├── demo-data/                 # synthetic CSVs for seeding/demo
├── docker-compose.yml         # Postgres only, for now
└── .env.example
```

## Environment variables
```
DATABASE_URL=postgresql://user:pass@localhost:5432/ledgerpilot
ANTHROPIC_API_KEY=
JWT_SECRET=
ENVIRONMENT=development
```
Do not add `REDIS_URL`, `S3_*`, or OAuth client vars until the corresponding feature phase begins.

## Naming conventions
- DB tables/columns: `snake_case`.
- Python: `snake_case` for functions/variables, `PascalCase` for classes.
- TypeScript: `camelCase` for variables/functions, `PascalCase` for components/types.
- API routes: plural nouns, resource-based (`/transactions`, not `/getTransactions`).

## Git strategy
- Trunk-based, short-lived feature branches: `feat/csv-import`, `feat/categorization-review`.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`.
- Tag milestones: `v0.1-scaffold`, `v0.1-mvp`, `v0.2-strong`, `v0.3-portfolio`.
