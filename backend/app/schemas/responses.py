"""Schémas de réponse. Reflètent le contrat documenté dans le README (section 8)
et les types consommés par le front (lib/types.ts)."""
from pydantic import BaseModel, Field


class CommuneRef(BaseModel):
    insee: str
    nom: str
    littoral: bool


class IndicateurOut(BaseModel):
    code: str
    libelle: str
    unite: str | None = None
    horizons: dict[str, float]  # {"2030": .., "2040": .., "2050": ..}
    source: str | None = None


class CommuneData(BaseModel):
    commune: CommuneRef
    scenario: str
    indicateurs: list[IndicateurOut]


class SimulationOut(BaseModel):
    commune: str
    scenario: str
    vegetalisation: float
    reference: dict[str, float]
    simule: dict[str, float]
    delta: dict[str, float]
    methode: str = Field(
        default="modele simplifie ilot de chaleur (pedagogique)",
    )


class SourceOut(BaseModel):
    name: str
    url: str | None = None
    licence: str | None = None
