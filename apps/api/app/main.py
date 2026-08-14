from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import transactions, organizations, reports

app = FastAPI(
    title="LedgerPilot API",
    description="API for LedgerPilot Financial Platform",
    version="0.1.0"
)

# Configure CORS restricted to configured frontend origins
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(organizations.router)
app.include_router(reports.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
