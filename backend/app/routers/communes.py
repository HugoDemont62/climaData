"""Recherche de communes et indicateurs projetés (US1, US2, US5, US6)."""
from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CommuneData, CommuneRef, IndicateurOut
from app.services import queries

router = APIRouter(prefix="/api/municipalities", tags=["communes"])

DEFAULT_SCENARIO = "RCP4.5"


@router.get("/search", response_model=list[CommuneRef])
def search_municipalities(
    code_postal: str = Query(..., min_length=5, max_length=5, pattern=r"^\d{5}$"),
    db: Session = Depends(get_db),
) -> list[CommuneRef]:
    """Résout un code postal en une ou plusieurs communes."""
    communes = queries.find_municipalities_by_postal_code(db, code_postal)
    return [
        CommuneRef(insee=c.insee_code, nom=c.name, littoral=c.coastal)
        for c in communes
    ]


@router.get("/{insee}", response_model=CommuneData)
def get_municipality_indicators(
    insee: str,
    scenario: str = Query(default=DEFAULT_SCENARIO),
    db: Session = Depends(get_db),
) -> CommuneData:
    """Indicateurs projetés d'une commune (horizons 2030/2040/2050)."""
    commune = queries.get_municipality(db, insee)
    if commune is None:
        raise HTTPException(status_code=404, detail="Commune inconnue")
    if not queries.scenario_exists(db, scenario):
        raise HTTPException(status_code=400, detail="Scénario invalide")

    projections = queries.get_projections(db, insee, scenario)

    # Regroupement par indicateur -> { horizon: valeur }.
    horizons_by_code: dict[str, dict[str, float]] = defaultdict(dict)
    meta: dict[str, tuple[str, str | None, str | None]] = {}
    for p in projections:
        code = p.indicator.code
        horizons_by_code[code][str(p.horizon)] = float(p.value)
        if code not in meta:
            source_name = p.indicator.source.name if p.indicator.source else None
            meta[code] = (p.indicator.label, p.indicator.unit, source_name)

    indicateurs = [
        IndicateurOut(
            code=code,
            libelle=meta[code][0],
            unite=meta[code][1],
            horizons=dict(sorted(horizons.items())),
            source=meta[code][2],
        )
        for code, horizons in sorted(horizons_by_code.items())
    ]

    return CommuneData(
        commune=CommuneRef(insee=commune.insee_code, nom=commune.name, littoral=commune.coastal),
        scenario=scenario,
        indicateurs=indicateurs,
    )
