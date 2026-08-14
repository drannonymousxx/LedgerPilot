# Database Schema — LedgerPilot

This is the source of truth for the schema. Agents implementing models/migrations must match this exactly. Do not add, rename, or remove columns without updating this file first.

## Design rules
- Primary keys: `UUID DEFAULT gen_random_uuid()`.
- Timestamps: `TIMESTAMPTZ NOT NULL DEFAULT now()`.
- Money: `amount_cents BIGINT` — never float/decimal.
- Every AI-touched entity keeps `ai_*` fields separate from `final_*` fields.
- Every table holding org data has `organization_id UUID NOT NULL REFERENCES organizations(id)`.

## MVP tables (build these now)

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT,
    role TEXT NOT NULL DEFAULT 'owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    parent_category_id UUID REFERENCES categories(id),
    UNIQUE (organization_id, name)
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    default_category_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, normalized_name)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    vendor_raw TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    amount_cents BIGINT NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    transaction_date DATE NOT NULL,
    description TEXT,
    source TEXT NOT NULL DEFAULT 'csv_import',
    ai_suggested_category_id UUID REFERENCES categories(id),
    ai_confidence NUMERIC(4,3),
    final_category_id UUID REFERENCES categories(id),
    review_status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | edited | rejected
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_transactions_org_status ON transactions(organization_id, review_status);
CREATE INDEX idx_transactions_date ON transactions(organization_id, transaction_date);
CREATE INDEX idx_transactions_vendor ON transactions(vendor_id);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID, -- NULL for batch actions (e.g. CSV import), set for single-entity actions (e.g. transaction review approval)
    before_value JSONB,
    after_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_org_time ON audit_logs(organization_id, created_at);
```

## Post-MVP tables (designed, not built until their feature phase starts)

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- invoice | receipt
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processing_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    document_id UUID REFERENCES documents(id),
    vendor_id UUID REFERENCES vendors(id),
    invoice_number TEXT,
    amount_cents BIGINT NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    invoice_date DATE,
    tax_cents BIGINT DEFAULT 0,
    ai_extracted_json JSONB,
    ai_confidence NUMERIC(4,3),
    review_status TEXT NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_org_status ON invoices(organization_id, review_status);

CREATE TABLE reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    transaction_id UUID REFERENCES transactions(id),
    invoice_id UUID REFERENCES invoices(id),
    match_status TEXT NOT NULL, -- matched | amount_mismatch | date_mismatch | unmatched
    match_score NUMERIC(4,3),
    matched_rules JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reconciliations_org_status ON reconciliations(organization_id, match_status);

CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    transaction_id UUID REFERENCES transactions(id),
    anomaly_type TEXT NOT NULL, -- large_amount | duplicate | new_vendor | no_supporting_doc
    detail JSONB,
    severity TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```,Description:
