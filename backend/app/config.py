"""Lecture des variables d'environnement (12-factor)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Base de données. Par défaut SQLite en mémoire pour permettre un démarrage
    # et des tests sans PostGIS ; en prod, surchargée par DATABASE_URL (PostGIS).
    database_url: str = "sqlite+pysqlite:///:memory:"

    api_geo_url: str = "https://geo.api.gouv.fr"
    ban_url: str = "https://api-adresse.data.gouv.fr"

    # Origines autorisées pour CORS, séparées par des virgules.
    cors_origins: str = "http://localhost:3000"

    env: str = "development"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
