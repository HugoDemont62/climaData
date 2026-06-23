"""Accès aux données : helpers de lecture partagés par les routers."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Municipality, Projection


def find_municipalities_by_postal_code(
    db: Session, postal_code: str
) -> list[Municipality]:
    stmt = (
        select(Municipality)
        .where(Municipality.postal_code == postal_code)
        .order_by(Municipality.name)
    )
    return list(db.scalars(stmt))


def get_municipality(db: Session, insee_code: str) -> Municipality | None:
    return db.get(Municipality, insee_code)


def scenario_exists(db: Session, code: str) -> bool:
    from app.models import Scenario

    return db.scalar(select(Scenario.id).where(Scenario.code == code)) is not None


def get_projections(
    db: Session, insee_code: str, scenario_code: str
) -> list[Projection]:
    from app.models import Scenario

    stmt = (
        select(Projection)
        .join(Scenario, Projection.scenario_id == Scenario.id)
        .where(Projection.insee_code == insee_code, Scenario.code == scenario_code)
    )
    return list(db.scalars(stmt))
