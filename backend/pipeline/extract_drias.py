"""Extraction des fichiers DRIAS / DRIAS-Eau (exports texte indicesQ50).

Les exports DRIAS sont des CSV `;` avec un en-tête commenté (#). Chaque ligne porte
un point de grille (lat/lon), un scénario, un horizon (H1/H2/H3) et une ou plusieurs
valeurs d'indices. La grille n'est pas communale : on rattache chaque commune du POC
au point de grille le plus proche de son centroïde.

Choix assumés (pédagogiques, à affiner avec le référent scientifique) :
- Horizons DRIAS H1/H2/H3 -> 2030 / 2040 / 2050.
- NORTX35 (jours TX>35 °C)  -> indicateur `canicule`.
- NORTR   (nuits tropicales) -> indicateur `nuits_chaudes`.
- NORSWIAV (humidité des sols, 0-1, élevé = humide) -> `stress_hydrique` = (1 - SWI) * 100.
- Hors domaine (outre-mer, p.ex. Fort-de-France) : aucune valeur DRIAS, repli ailleurs.
"""
from __future__ import annotations

import glob
import os
from dataclasses import dataclass

# Centroïdes approximatifs des communes du POC (WGS84).
COMMUNE_COORDS: dict[str, tuple[float, float]] = {
    "59350": (50.6292, 3.0573),   # Lille
    "75056": (48.8566, 2.3522),   # Paris
    "13055": (43.2965, 5.3698),   # Marseille
    "17300": (46.1603, -1.1511),  # La Rochelle
    "33063": (44.8378, -0.5792),  # Bordeaux
    "97209": (14.6037, -61.0594),  # Fort-de-France (hors domaine EUROCORDEX)
}

HORIZON_MAP = {"H1": 2030, "H2": 2040, "H3": 2050}

INDEX_TO_INDICATOR = {
    "NORTX35": "canicule",
    "NORTR": "nuits_chaudes",
    "NORSWIAV": "stress_hydrique",
}

# Au-delà de ce rayon (en degrés), on considère la commune hors domaine.
DOMAIN_THRESHOLD_DEG = 0.5


@dataclass
class DriasRecord:
    point: str
    lat: float
    lon: float
    horizon: str
    values: dict[str, float]


def parse_file(path: str) -> tuple[str | None, list[DriasRecord]]:
    """Parse un export DRIAS. Renvoie (scénario, enregistrements)."""
    columns: list[str] | None = None
    scenario: str | None = None
    records: list[DriasRecord] = []

    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            if line.startswith("#"):
                stripped = line.lstrip("#").strip()
                if stripped.startswith("Point;"):
                    columns = [c for c in stripped.split(";") if c]
                continue
            if not line.strip() or columns is None:
                continue

            fields = line.split(";")
            row = dict(zip(columns, fields))
            scenario = row.get("Contexte")
            values = {
                idx: float(row[idx])
                for idx in columns[5:]
                if row.get(idx) not in (None, "")
            }
            records.append(
                DriasRecord(
                    point=row["Point"],
                    lat=float(row["Latitude"]),
                    lon=float(row["Longitude"]),
                    horizon=row["Période"],
                    values=values,
                )
            )
    return scenario, records


def _nearest_point(
    points: dict[str, tuple[float, float]], lat: float, lon: float
) -> tuple[str | None, float]:
    """Point de grille le plus proche (distance euclidienne en degrés, suffisante ici)."""
    best_id, best_dist = None, float("inf")
    for pid, (plat, plon) in points.items():
        dist = (plat - lat) ** 2 + (plon - lon) ** 2
        if dist < best_dist:
            best_id, best_dist = pid, dist
    return best_id, best_dist**0.5


def _transform(index: str, value: float) -> float:
    """Convertit une valeur d'indice DRIAS en valeur d'indicateur ClimaData."""
    if index == "NORSWIAV":
        # Humidité des sols (0-1) -> stress hydrique (0-100), borné.
        return float(max(0, min(100, round((1.0 - value) * 100))))
    return float(round(value))


def extract(raw_dir: str) -> list[tuple[str, str, str, int, float]]:
    """Produit les projections (insee, code_indicateur, scénario, horizon, valeur)."""
    files = sorted(glob.glob(os.path.join(raw_dir, "*.txt")))

    # data[scenario][index][point] = {"lat","lon","h": {horizon: value}}
    data: dict[str, dict[str, dict[str, dict]]] = {}

    for path in files:
        scenario, records = parse_file(path)
        if scenario is None:
            continue
        for rec in records:
            for index, value in rec.values.items():
                bucket = data.setdefault(scenario, {}).setdefault(index, {})
                point = bucket.setdefault(rec.point, {"lat": rec.lat, "lon": rec.lon, "h": {}})
                point["h"][rec.horizon] = value

    projections: list[tuple[str, str, str, int, float]] = []
    for scenario, by_index in data.items():
        for index, points in by_index.items():
            indicator = INDEX_TO_INDICATOR.get(index)
            if indicator is None:
                continue
            coords = {pid: (p["lat"], p["lon"]) for pid, p in points.items()}
            for insee, (clat, clon) in COMMUNE_COORDS.items():
                pid, dist = _nearest_point(coords, clat, clon)
                if pid is None or dist > DOMAIN_THRESHOLD_DEG:
                    continue  # hors domaine -> repli géré par le loader
                for horizon, value in points[pid]["h"].items():
                    year = HORIZON_MAP.get(horizon)
                    if year is None:
                        continue
                    projections.append(
                        (insee, indicator, scenario, year, _transform(index, value))
                    )
    return projections
