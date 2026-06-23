"""Chargement des données dans la base.

Deux modes :
- `--seed`  : jeu de démonstration synthétique (data/seed/dataset.py).
- `--drias` : projections réelles extraites de data/raw (DRIAS / DRIAS-Eau), avec
              repli sur le jeu de démo pour ce que DRIAS ne couvre pas (biodiversité,
              communes hors domaine comme l'outre-mer).

Usage :
    python -m pipeline.load --seed
    python -m pipeline.load --drias
"""
from __future__ import annotations

import argparse

from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import (
    Indicator,
    Municipality,
    Projection,
    Scenario,
    SimulationLever,
    Source,
)
from data.seed import dataset
from pipeline.extract_drias import extract

RAW_DIR = "data/raw"


def _is_empty(db: Session) -> bool:
    return db.query(Municipality).first() is None


def _load_reference_data(
    db: Session,
) -> tuple[dict[str, Indicator], dict[str, Scenario]]:
    """Sources, indicateurs, scénarios, communes, leviers (communs aux deux modes)."""
    sources = {
        s["name"]: Source(name=s["name"], url=s["url"], licence=s["licence"])
        for s in dataset.SOURCES
    }
    db.add_all(sources.values())
    db.flush()

    indicators = {
        code: Indicator(
            code=code, label=label, unit=unit, family=family, source=sources[source_name]
        )
        for code, (label, unit, family, source_name) in dataset.INDICATORS.items()
    }
    db.add_all(indicators.values())

    scenarios = {
        code: Scenario(code=code, label=label)
        for code, label in dataset.SCENARIOS.items()
    }
    db.add_all(scenarios.values())

    for insee, (cp, name, dept, coastal) in dataset.MUNICIPALITIES.items():
        db.add(
            Municipality(
                insee_code=insee, postal_code=cp, name=name, department=dept, coastal=coastal
            )
        )

    db.add_all(
        SimulationLever(
            code=lever["code"],
            label=lever["label"],
            min=lever["min"],
            max=lever["max"],
            coefficient=lever["coefficient"],
        )
        for lever in dataset.LEVERS
    )
    db.flush()
    return indicators, scenarios


def _insert_projections(
    db: Session,
    indicators: dict[str, Indicator],
    scenarios: dict[str, Scenario],
    rows: list[tuple[str, str, str, int, float]],
) -> int:
    count = 0
    for insee, code, scenario_code, horizon, value in rows:
        db.add(
            Projection(
                insee_code=insee,
                indicator_id=indicators[code].id,
                scenario_id=scenarios[scenario_code].id,
                horizon=horizon,
                value=value,
            )
        )
        count += 1
    return count


def _summary(db: Session, indicators, scenarios, projections, **extra) -> dict[str, int]:
    return {
        "sources": len(dataset.SOURCES),
        "indicators": len(indicators),
        "scenarios": len(scenarios),
        "municipalities": len(dataset.MUNICIPALITIES),
        "projections": projections,
        **extra,
    }


def load_seed(db: Session) -> dict[str, int]:
    """Charge le jeu de démo. Idempotent : ne fait rien si la base est déjà peuplée."""
    if not _is_empty(db):
        return {"skipped": 1}

    indicators, scenarios = _load_reference_data(db)
    projections = _insert_projections(
        db, indicators, scenarios, list(dataset.iter_projections())
    )
    db.commit()
    return _summary(db, indicators, scenarios, projections)


def load_drias(db: Session, raw_dir: str = RAW_DIR) -> dict[str, int]:
    """Charge les projections DRIAS réelles + repli démo pour les manques.

    Idempotent : ne fait rien si la base est déjà peuplée.
    """
    if not _is_empty(db):
        return {"skipped": 1}

    indicators, scenarios = _load_reference_data(db)

    drias_rows = extract(raw_dir)
    covered = {(insee, code, scen, hz) for insee, code, scen, hz, _ in drias_rows}

    # Repli : toute clé non couverte par DRIAS reprend la valeur de démonstration
    # (biodiversité — non issue de DRIAS — et communes hors domaine).
    fallback_rows = [
        row
        for row in dataset.iter_projections()
        if (row[0], row[1], row[2], row[3]) not in covered
    ]

    n_drias = _insert_projections(db, indicators, scenarios, drias_rows)
    n_fallback = _insert_projections(db, indicators, scenarios, fallback_rows)
    db.commit()
    return _summary(
        db,
        indicators,
        scenarios,
        n_drias + n_fallback,
        drias=n_drias,
        fallback=n_fallback,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Chargement des données ClimaData")
    parser.add_argument("--seed", action="store_true", help="Jeu de démonstration POC")
    parser.add_argument(
        "--drias", action="store_true", help="Projections réelles DRIAS (data/raw) + repli"
    )
    args = parser.parse_args()

    # Crée les tables si absentes (sur PostgreSQL, géré par Alembic ; utile en SQLite).
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        if args.drias:
            print(f"DRIAS chargé : {load_drias(db)}")
        elif args.seed:
            print(f"Seed chargé : {load_seed(db)}")
        else:
            print("Précisez --seed ou --drias.")


if __name__ == "__main__":
    main()
