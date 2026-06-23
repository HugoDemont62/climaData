"""Tests du parseur / mapping DRIAS."""
from pipeline.extract_drias import _transform, extract, parse_file

# Point de grille proche du centroïde de Lille (50.6292, 3.0573).
INDICES_FILE = """\
#-----------------------------------------------------------------------------
# Producteur : MF-DCSC
# Scenario :
#     RCP4.5 : Emissions modérées
# Format des enregistrements
# Point;Latitude;Longitude;Contexte;Période;NORTX35;NORTR;
139;50.63;3.06;RCP4.5;H1;2;10;
139;50.63;3.06;RCP4.5;H2;4;15;
139;50.63;3.06;RCP4.5;H3;6;22;
"""

# Point SIM2 proche de Lille, indice d'humidité des sols.
SIM2_FILE = """\
# Format des enregistrements
# Point;Latitude;Longitude;Contexte;Période;NORSWIAV;
501;50.64;3.05;RCP4.5;H1;0.42;
501;50.64;3.05;RCP4.5;H2;0.40;
501;50.64;3.05;RCP4.5;H3;0.35;
"""


def _write(raw_dir, name, content):
    path = raw_dir / name
    path.write_text(content, encoding="utf-8")
    return path


def test_parse_file_lit_scenario_et_valeurs(tmp_path):
    path = _write(tmp_path, "indices.txt", INDICES_FILE)
    scenario, records = parse_file(str(path))
    assert scenario == "RCP4.5"
    assert len(records) == 3
    h1 = next(r for r in records if r.horizon == "H1")
    assert h1.values == {"NORTX35": 2.0, "NORTR": 10.0}


def test_transform_humidite_vers_stress_hydrique():
    # SWI 0.42 (humide) -> stress (1 - 0.42) * 100 = 58.
    assert _transform("NORSWIAV", 0.42) == 58.0
    # Les autres indices sont arrondis tels quels.
    assert _transform("NORTX35", 6.0) == 6.0


def test_extract_mappe_la_commune_au_point_le_plus_proche(tmp_path):
    _write(tmp_path, "indices.txt", INDICES_FILE)
    _write(tmp_path, "sim2.txt", SIM2_FILE)
    rows = extract(str(tmp_path))

    # Seule Lille a un point de grille à portée ; les autres communes sont hors seuil.
    assert {r[0] for r in rows} == {"59350"}

    by_key = {(code, year): value for _, code, _, year, value in rows}
    assert by_key[("canicule", 2030)] == 2.0
    assert by_key[("canicule", 2050)] == 6.0
    assert by_key[("nuits_chaudes", 2040)] == 15.0
    assert by_key[("stress_hydrique", 2030)] == 58.0


def test_extract_ignore_les_communes_hors_domaine(tmp_path):
    _write(tmp_path, "indices.txt", INDICES_FILE)
    rows = extract(str(tmp_path))
    # Fort-de-France (outre-mer) n'est jamais rattaché à un point métropolitain.
    assert "97209" not in {r[0] for r in rows}
