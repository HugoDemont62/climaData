"""Modèles ORM. Voir le schéma physique du README (section 6).

La colonne `geom` (PostGIS) n'est pas mappée ici : elle est créée par la migration
Alembic et n'est utilisée que par le pipeline d'ingestion, jamais par l'API.
"""
from app.models.entities import (
    Indicator,
    Municipality,
    Projection,
    Scenario,
    SimulationLever,
    Source,
)

__all__ = [
    "Source",
    "Municipality",
    "Indicator",
    "Scenario",
    "Projection",
    "SimulationLever",
]
