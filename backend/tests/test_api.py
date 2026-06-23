"""Tests des endpoints de l'API (périmètre POC)."""


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_search_resout_le_code_postal(client):
    resp = client.get("/api/municipalities/search", params={"code_postal": "59000"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0] == {"insee": "59350", "nom": "Lille", "littoral": False}


def test_search_commune_littorale(client):
    resp = client.get("/api/municipalities/search", params={"code_postal": "17000"})
    assert resp.status_code == 200
    assert resp.json()[0]["littoral"] is True


def test_search_code_postal_invalide(client):
    resp = client.get("/api/municipalities/search", params={"code_postal": "abc"})
    assert resp.status_code == 422


def test_indicateurs_commune(client):
    resp = client.get("/api/municipalities/59350", params={"scenario": "RCP4.5"})
    assert resp.status_code == 200
    data = resp.json()

    assert data["commune"] == {"insee": "59350", "nom": "Lille", "littoral": False}
    assert data["scenario"] == "RCP4.5"

    par_code = {ind["code"]: ind for ind in data["indicateurs"]}
    assert set(par_code) == {
        "canicule",
        "nuits_chaudes",
        "stress_hydrique",
        "biodiversite",
    }
    canicule = par_code["canicule"]
    assert canicule["horizons"] == {"2030": 9, "2040": 14, "2050": 21}
    assert canicule["source"] == "DRIAS"
    assert canicule["unite"] == "jours/an"


def test_indicateurs_commune_inconnue(client):
    resp = client.get("/api/municipalities/00000")
    assert resp.status_code == 404


def test_indicateurs_scenario_invalide(client):
    resp = client.get("/api/municipalities/59350", params={"scenario": "RCP9.9"})
    assert resp.status_code == 400


def test_simulation_exemple_readme(client):
    resp = client.get(
        "/api/municipalities/59350/simulation",
        params={"vegetalisation": 30, "scenario": "RCP4.5"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["commune"] == "59350"
    assert data["reference"]["canicule_2050"] == 21
    assert data["simule"]["canicule_2050"] == 17
    assert data["delta"]["canicule_2050"] == -4
    assert "pedagogique" in data["methode"]


def test_simulation_vegetalisation_hors_bornes(client):
    resp = client.get(
        "/api/municipalities/59350/simulation", params={"vegetalisation": 150}
    )
    assert resp.status_code == 400


def test_simulation_commune_inconnue(client):
    resp = client.get("/api/municipalities/00000/simulation")
    assert resp.status_code == 404


def test_sources(client):
    resp = client.get("/api/sources")
    assert resp.status_code == 200
    noms = {s["name"] for s in resp.json()}
    assert {"DRIAS", "DRIAS-Eau", "INPN", "API Géo / BAN"} <= noms
