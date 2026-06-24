"""Test du client API Géo (récupération du contour communal), HTTP mocké."""
import httpx

from pipeline.communes import fetch_contour

FEATURE = {
    "type": "Feature",
    "properties": {"code": "59350", "nom": "Lille"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[[3.0, 50.6], [3.1, 50.6], [3.1, 50.7], [3.0, 50.6]]],
    },
}


def test_fetch_contour_extrait_la_geometrie():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/communes/59350"
        assert request.url.params.get("geometry") == "contour"
        return httpx.Response(200, json=FEATURE)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    geometry = fetch_contour("59350", base_url="https://geo.test", client=client)

    assert geometry["type"] == "Polygon"
    assert geometry["coordinates"][0][0] == [3.0, 50.6]


def test_fetch_contour_sans_geometrie_renvoie_none():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"type": "Feature", "properties": {}})

    client = httpx.Client(transport=httpx.MockTransport(handler))
    assert fetch_contour("00000", base_url="https://geo.test", client=client) is None