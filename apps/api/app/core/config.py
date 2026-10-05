from pydantic_settings import BaseSettings
from typing import List, Union, Optional
from pydantic import field_validator


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    ALLOW_UNVERIFIED_JWT: bool = False

    RATE_LIMIT_JOIN_ORG: str = "5/minute"
    RATE_LIMIT_SET_PASSWORD: str = "5/minute"

    # Default local development PostgreSQL database connection string
    DATABASE_URL: str = "postgresql://postgres:postgres@127.0.0.1:5432/ledgerpilot"

    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000"]
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-flash-latest"

    SUPABASE_URL: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None


    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
