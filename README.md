# LedgerPilot

LedgerPilot is an AI-assisted financial ledger application structured as a monorepo containing a FastAPI backend and a Next.js 14 frontend.

## Repository Structure

```
ledgerpilot/
├── apps/
│   ├── web/   # Next.js 14 App Router (TypeScript + Tailwind CSS)
│   └── api/   # FastAPI (Python + SQLAlchemy + Alembic)
├── docker-compose.yml # PostgreSQL 16 service
├── .env.example
└── README.md
```

## Quick Start Guide

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Node.js 18+ & npm

### 2. Start PostgreSQL Database
```bash
docker-compose up -d
```

### 3. Setup and Run Backend API (`apps/api`)
1. Change directory to `apps/api`:
   ```bash
   cd apps/api
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` or set environment variables:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ledgerpilot
   ```
5. Run database migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`. Health check endpoint: `http://localhost:8000/health`.

### 4. Setup and Run Frontend Web App (`apps/web`)
1. Change directory to `apps/web`:
   ```bash
   cd apps/web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variable:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The web application will be available at `http://localhost:3000`. Navigate to `http://localhost:3000/dashboard` to check the API connection status.
