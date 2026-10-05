from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, transactions, organizations, reports

from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.core.limiter import limiter

from slowapi.middleware import SlowAPIMiddleware

app = FastAPI(
    title="LedgerPilot API",
    description="API for LedgerPilot Financial Platform",
    version="0.1.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)



# Configure CORS restricted to configured frontend origins
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(organizations.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")

# Also include legacy un-prefixed routes for backwards compatibility if needed
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(organizations.router)
app.include_router(reports.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
