"""Modèle pédagogique simplifié d'îlot de chaleur urbain.

Le levier actionné est le taux de végétalisation urbaine (0-100 %), avec une option
de désimperméabilisation des sols. Les indicateurs de chaleur baissent à mesure que
la végétalisation augmente. Le modèle est volontairement simple et assumé comme
pédagogique : il illustre une tendance, pas une prévision (cf. dossier, section 05).
"""
from __future__ import annotations

# Sensibilité de chaque indicateur au levier de végétalisation.
# Valeur = fraction maximale de réduction atteignable à 100 % de végétalisation.
SENSITIVITY: dict[str, float] = {
    "canicule": 0.6,
    "nuits_chaudes": 0.6,
    "stress_hydrique": 0.3,
    "biodiversite": 0.2,
}

# La désimperméabilisation amplifie l'effet de la végétalisation (bonus relatif).
DESIMP_BONUS = 0.3

# Garde-fou : on ne prétend pas à une réduction totale.
MAX_FACTOR = 0.9

METHODE = "modele simplifie ilot de chaleur (pedagogique)"


def _code_from_key(key: str) -> str:
    """`canicule_2050` -> `canicule` (l'horizon est le dernier segment)."""
    return key.rsplit("_", 1)[0]


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def simulate_levers(
    references: dict[str, float],
    vegetalisation: float,
    desimpermeabilisation: float = 0.0,
) -> tuple[dict[str, float], dict[str, float], dict[str, float]]:
    """Applique les leviers à des valeurs de référence `{code_horizon: valeur}`.

    Renvoie trois dictionnaires de mêmes clés : référence, valeur simulée, delta.
    Les indicateurs sans sensibilité connue sont ignorés.
    """
    veg = _clamp(vegetalisation, 0.0, 100.0) / 100.0
    desimp = _clamp(desimpermeabilisation, 0.0, 100.0) / 100.0

    reference: dict[str, float] = {}
    simule: dict[str, float] = {}
    delta: dict[str, float] = {}

    for key, raw_value in references.items():
        sensitivity = SENSITIVITY.get(_code_from_key(key))
        if sensitivity is None:
            continue

        value = float(raw_value)
        factor = veg * sensitivity * (1.0 + desimp * DESIMP_BONUS)
        factor = min(factor, MAX_FACTOR)

        reduction = round(value * factor)
        simulated = max(0, round(value) - reduction)

        reference[key] = round(value)
        simule[key] = simulated
        delta[key] = simulated - round(value)

    return reference, simule, delta
