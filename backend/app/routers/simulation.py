"""Simulateur : effet des leviers locaux sur les indicateurs (US4)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SimulationOut
from app.services import queries
from app.services.simulateur import METHODE, SENSITIVITY, simulate_levers

router = APIRouter(prefix="/api/municipalities", tags=["simulation"])

DEFAULT_SCENARIO = "RCP4.5"


@router.get("/{insee}/simulation", response_model=SimulationOut)
def simulate(
    insee: str,
    vegetalisation: float = Query(default=0.0),
    desimpermeabilisation: float = Query(default=0.0),
    scenario: str = Query(default=DEFAULT_SCENARIO),
    db: Session = Depends(get_db),
) -> SimulationOut:
    """Applique le levier de végétalisation aux indicateurs de chaleur."""
    if not (0.0 <= vegetalisation <= 100.0):
        raise HTTPException(status_code=400, detail="vegetalisation hors de [0, 100]")
    if not (0.0 <= desimpermeabilisation <= 100.0):
        raise HTTPException(
            status_code=400, detail="desimpermeabilisation hors de [0, 100]"
        )

    commune = queries.get_municipality(db, insee)
    if commune is None:
        raise HTTPException(status_code=404, detail="Commune inconnue")
    if not queries.scenario_exists(db, scenario):
        raise HTTPException(status_code=400, detail="Scénario invalide")

    projections = queries.get_projections(db, insee, scenario)

    # Références { code_horizon: valeur } pour les indicateurs sensibles au levier.
    references = {
        f"{p.indicator.code}_{p.horizon}": float(p.value)
        for p in projections
        if p.indicator.code in SENSITIVITY
    }

    reference, simule, delta = simulate_levers(
        references, vegetalisation=vegetalisation, desimpermeabilisation=desimpermeabilisation
    )

    return SimulationOut(
        commune=insee,
        scenario=scenario,
        vegetalisation=vegetalisation,
        reference=reference,
        simule=simule,
        delta=delta,
        methode=METHODE,
    )
