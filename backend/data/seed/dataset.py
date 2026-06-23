"""Jeu de démonstration du POC (valeurs illustratives, pédagogiques).

Six communes représentatives — dont deux littorales et une d'outre-mer — couvrant
4 codes d'indicateurs répartis en 3 familles, sur 3 horizons et 2 scénarios.
Les valeurs ne sont pas des projections officielles : elles servent la démo.
Lille / RCP4.5 reprend l'exemple chiffré du README.
"""
from __future__ import annotations

HORIZONS = [2030, 2040, 2050]

# Facteur appliqué au scénario pessimiste par rapport au scénario médian.
RCP85_FACTOR = 1.3

SOURCES = [
    {
        "name": "DRIAS",
        "url": "https://www.drias-climat.fr",
        "licence": "Licence Ouverte (Etalab)",
    },
    {
        "name": "DRIAS-Eau",
        "url": "https://www.drias-eau.fr",
        "licence": "Licence Ouverte (Etalab)",
    },
    {
        "name": "INPN",
        "url": "https://inpn.mnhn.fr",
        "licence": "Licence Ouverte (Etalab)",
    },
    {
        "name": "API Géo / BAN",
        "url": "https://geo.api.gouv.fr",
        "licence": "Licence Ouverte (Etalab)",
    },
]

# code -> (libellé, unité, famille, nom de la source)
INDICATORS = {
    "canicule": ("Jours de forte chaleur (TX > 35 °C)", "jours/an", "canicule", "DRIAS"),
    "nuits_chaudes": ("Nuits chaudes (> 20 °C)", "nuits/an", "canicule", "DRIAS"),
    "stress_hydrique": ("Stress hydrique", "indice (0-100)", "eau", "DRIAS-Eau"),
    "biodiversite": ("Pression sur la biodiversité", "indice (0-100)", "biodiversite", "INPN"),
}

SCENARIOS = {
    "RCP4.5": "Scénario médian",
    "RCP8.5": "Scénario pessimiste",
}

# insee -> (code postal, nom, département, littoral)
MUNICIPALITIES = {
    "59350": ("59000", "Lille", "59", False),
    "75056": ("75001", "Paris", "75", False),
    "13055": ("13001", "Marseille", "13", True),
    "17300": ("17000", "La Rochelle", "17", True),
    "33063": ("33000", "Bordeaux", "33", False),
    "97209": ("97200", "Fort-de-France", "972", True),
}

# Valeurs sous scénario médian RCP4.5 : insee -> code -> (2030, 2040, 2050).
BASE_VALUES_RCP45 = {
    "59350": {
        "canicule": (9, 14, 21),
        "nuits_chaudes": (12, 19, 30),
        "stress_hydrique": (25, 32, 40),
        "biodiversite": (30, 38, 47),
    },
    "75056": {
        "canicule": (12, 18, 27),
        "nuits_chaudes": (15, 24, 38),
        "stress_hydrique": (30, 38, 48),
        "biodiversite": (35, 44, 55),
    },
    "13055": {
        "canicule": (18, 26, 38),
        "nuits_chaudes": (22, 33, 49),
        "stress_hydrique": (45, 55, 67),
        "biodiversite": (40, 50, 62),
    },
    "17300": {
        "canicule": (8, 12, 18),
        "nuits_chaudes": (10, 16, 25),
        "stress_hydrique": (28, 35, 44),
        "biodiversite": (33, 41, 51),
    },
    "33063": {
        "canicule": (14, 21, 31),
        "nuits_chaudes": (16, 25, 39),
        "stress_hydrique": (35, 44, 55),
        "biodiversite": (37, 46, 57),
    },
    "97209": {
        "canicule": (20, 28, 40),
        "nuits_chaudes": (30, 42, 60),
        "stress_hydrique": (38, 47, 58),
        "biodiversite": (45, 56, 69),
    },
}

LEVERS = [
    {
        "code": "vegetalisation",
        "label": "Végétalisation urbaine",
        "min": 0,
        "max": 100,
        "coefficient": 0.6,
    },
    {
        "code": "desimpermeabilisation",
        "label": "Désimperméabilisation des sols",
        "min": 0,
        "max": 100,
        "coefficient": 0.3,
    },
]


def iter_projections():
    """Génère les tuples (insee, code_indicateur, code_scenario, horizon, valeur)."""
    for insee, by_code in BASE_VALUES_RCP45.items():
        for code, values in by_code.items():
            for horizon, value in zip(HORIZONS, values):
                yield (insee, code, "RCP4.5", horizon, float(value))
                yield (insee, code, "RCP8.5", horizon, float(round(value * RCP85_FACTOR)))
