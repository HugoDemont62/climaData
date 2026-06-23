"""Point d'entrée FastAPI de l'API ClimaData."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import communes, simulation, sources

settings = get_settings()

app = FastAPI(
    title="ClimaData API",
    description="Indicateurs climatiques projetés par commune (horizons 2030/2040/2050).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(communes.router)
app.include_router(simulation.router)
app.include_router(sources.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    """Vérification de disponibilité."""
    return {"status": "ok"}
