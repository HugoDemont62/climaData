"""Référentiel communes : géométries depuis l'API Géo (US5, support cartographie).

Récupère le contour de chaque commune du POC via geo.api.gouv.fr et le charge dans
la colonne PostGIS `municipality.geom`. La géométrie n'étant pas mappée dans l'ORM
(pour garder les modèles portables), l'écriture se fait en SQL PostGIS brut.

Usage (nécessite PostGIS et un accès réseau) :
    python -m pipeline.communes
"""
from __future__ import annotations

import json

import httpx
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal
from data.seed import dataset

# Convertit un contour GeoJSON en MultiPolygon SRID 4326 et l'affecte à la commune.
_UPDATE_SQL = text(
    """
    UPDATE municipality
       SET geom = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(:geojson), 4326))
     WHERE insee_code = :insee
    """
)


def fetch_contour(
    insee: str,
    base_url: str | None = None,
    client: httpx.Client | None = None,
) -> dict | None:
    """Renvoie la géométrie GeoJSON (contour) d'une commune, ou None si absente."""
    base_url = base_url or get_settings().api_geo_url
    owns_client = client is None
    client = client or httpx.Client(timeout=20.0)
    try:
        resp = client.get(
            f"{base_url}/communes/{insee}",
            params={"geometry": "contour", "format": "geojson"},
        )
        resp.raise_for_status()
        feature = resp.json()
        return feature.get("geometry")
    finally:
        if owns_client:
            client.close()


def load_geometries(db: Session, base_url: str | None = None) -> dict[str, object]:
    """Charge les contours des communes du POC dans `municipality.geom`."""
    updated = 0
    missing: list[str] = []

    with httpx.Client(timeout=20.0) as client:
        for insee in dataset.MUNICIPALITIES:
            geometry = fetch_contour(insee, base_url=base_url, client=client)
            if not geometry:
                missing.append(insee)
                continue
            db.execute(
                _UPDATE_SQL, {"geojson": json.dumps(geometry), "insee": insee}
            )
            updated += 1

    db.commit()
    return {"updated": updated, "missing": missing}


def main() -> None:
    with SessionLocal() as db:
        result = load_geometries(db)
        print(f"Géométries chargées : {result}")


if __name__ == "__main__":
    main()