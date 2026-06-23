"""Tests du modèle pédagogique d'îlot de chaleur (service simulateur)."""
from app.services.simulateur import simulate_levers


def test_exemple_readme_canicule_2050():
    """Cas documenté : végétalisation 30 % -> canicule_2050 de 21 à 17 (delta -4)."""
    reference, simule, delta = simulate_levers(
        references={"canicule_2050": 21}, vegetalisation=30
    )
    assert reference == {"canicule_2050": 21}
    assert simule == {"canicule_2050": 17}
    assert delta == {"canicule_2050": -4}


def test_zero_vegetalisation_ne_change_rien():
    reference, simule, delta = simulate_levers(
        references={"canicule_2050": 21}, vegetalisation=0
    )
    assert simule == {"canicule_2050": 21}
    assert delta == {"canicule_2050": 0}


def test_plus_de_vegetalisation_reduit_davantage():
    _, simule_30, _ = simulate_levers({"canicule_2050": 21}, vegetalisation=30)
    _, simule_60, _ = simulate_levers({"canicule_2050": 21}, vegetalisation=60)
    assert simule_60["canicule_2050"] < simule_30["canicule_2050"]


def test_indicateur_hors_perimetre_ignore():
    """Un indicateur sans sensibilité au levier n'apparaît pas dans la sortie."""
    reference, simule, delta = simulate_levers(
        references={"indicateur_inconnu_2050": 10}, vegetalisation=50
    )
    assert reference == {}
    assert simule == {}
    assert delta == {}


def test_desimpermeabilisation_amplifie_l_effet():
    _, simule_sans, _ = simulate_levers({"canicule_2050": 21}, vegetalisation=30)
    _, simule_avec, _ = simulate_levers(
        {"canicule_2050": 21}, vegetalisation=30, desimpermeabilisation=50
    )
    assert simule_avec["canicule_2050"] <= simule_sans["canicule_2050"]


def test_valeur_jamais_negative():
    _, simule, _ = simulate_levers({"canicule_2050": 2}, vegetalisation=100)
    assert simule["canicule_2050"] >= 0
