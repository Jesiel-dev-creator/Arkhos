"""ArkhosAI configuration via environment variables."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    mistral_api_key: str = Field(alias="MISTRAL_API_KEY")
    arkhos_env: str = "development"
    max_generations_per_ip: int = 3
    budget_per_generation_eur: float = 0.25
    global_daily_budget_eur: float = 25.00
    max_prompt_length: int = 1000
    database_path: str = "arkhos.db"
    sandbox_url: str = "http://localhost:8001"
    sandbox_preview_url: str = "http://localhost:3001"
    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""

    model_config = {
        "env_prefix": "ARKHOS_",
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
        "populate_by_name": True,
    }


def get_settings() -> Settings:
    """Return application settings."""
    return Settings()  # type: ignore[call-arg]
