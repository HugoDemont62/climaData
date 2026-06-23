# ClimaData — API & Moteur de données

Moteur de données géolocalisées et API climat de ClimaData.
Responsable : Hugo Potier.

Ce service ingère les projections climatiques publiques, les structure dans une base géospatiale, et expose une API légère qui sert au front les indicateurs d'une commune à partir de son code postal, aux horizons 2030, 2040 et 2050.

---

## 1. Stack

- **Python 3.12**
- **FastAPI** (API REST asynchrone)
- **PostgreSQL 16 + PostGIS** (stockage géospatial)
- **SQLAlchemy** + **Alembic** (ORM et migrations)
- **httpx** (appels API Géo / Base Adresse Nationale)
- **pandas** / **xarray** (lecture des fichiers DRIAS netCDF/CSV)
- **uvicorn** (serveur ASGI)
- **pytest** (tests)
- Hébergement cible : **Scaleway** (base managée + conteneur)

---

## 2. Prérequis

- Python 3.12 et `pip`
- PostgreSQL 16 avec l'extension PostGIS, en local ou via Docker
- Un compte sur les portails DRIAS / DRIAS-Eau pour télécharger les jeux de données (téléchargement manuel, formats lourds)

Option Docker pour la base :

```bash
docker run --name climadata-db -e POSTGRES_PASSWORD=climadata \
  -e POSTGRES_DB=climadata -p 5432:5432 -d postgis/postgis:16-3.4
```

---

## 3. Arborescence du projet

```
climadata-api/
├── app/
│   ├── main.py              # point d'entrée FastAPI
│   ├── config.py            # lecture des variables d'environnement
│   ├── database.py          # session SQLAlchemy + PostGIS
│   ├── models/              # tables (Commune, Indicateur, Projection, ...)
│   ├── schemas/             # schémas Pydantic (réponses API)
│   ├── routers/
│   │   ├── communes.py      # recherche + indicateurs par commune
│   │   ├── simulation.py    # coefficients du simulateur
│   │   └── sources.py       # sources et licences
│   └── services/
│       └── simulateur.py    # modèle simplifié îlot de chaleur
├── pipeline/
│   ├── 01_communes.py       # référentiel communes (API Géo / BAN)
│   ├── 02_extract_drias.py  # lecture des fichiers DRIAS / DRIAS-Eau
│   ├── 03_transform.py      # normalisation + calage Climadiag
│   └── 04_load.py           # chargement dans PostGIS
├── data/
│   ├── raw/                 # fichiers DRIAS bruts (non versionnés)
│   └── seed/                # jeu de démo POC (communes de test)
├── migrations/              # Alembic
├── tests/
├── .env.example
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 4. Installation et lancement

```bash
# 1. Environnement virtuel
python -m venv .venv && source .venv/bin/activate

# 2. Dépendances
pip install -r requirements.txt

# 3. Variables d'environnement
cp .env.example .env        # puis ajuster les valeurs

# 4. Migrations (création des tables + PostGIS)
alembic upgrade head

# 5. Jeu de données de démo (communes du POC)
python -m pipeline.04_load --seed

# 6. Lancement de l'API
uvicorn app.main:app --reload --port 8000
```

API disponible sur `http://localhost:8000`.
Documentation interactive auto-générée : `http://localhost:8000/docs`.

---

## 5. Variables d'environnement (`.env`)

```env
DATABASE_URL=postgresql+psycopg://climadata:climadata@localhost:5432/climadata
API_GEO_URL=https://geo.api.gouv.fr
BAN_URL=https://api-adresse.data.gouv.fr
CORS_ORIGINS=http://localhost:3000
ENV=development
```

`CORS_ORIGINS` doit autoriser l'URL du front (en local `http://localhost:3000`, en prod l'URL Vercel).

---

## 6. Base de données

Modèle physique simplifié, orienté restitution. Schéma de référence :

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE source (
  id        SERIAL PRIMARY KEY,
  nom       TEXT NOT NULL,
  url       TEXT,
  licence   TEXT
);

CREATE TABLE commune (
  code_insee   VARCHAR(5) PRIMARY KEY,
  code_postal  VARCHAR(5) NOT NULL,
  nom          TEXT NOT NULL,
  departement  VARCHAR(3),
  littoral     BOOLEAN DEFAULT FALSE,
  geom         GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX idx_commune_cp ON commune (code_postal);
CREATE INDEX idx_commune_geom ON commune USING GIST (geom);

CREATE TABLE indicateur (
  id        SERIAL PRIMARY KEY,
  code      TEXT UNIQUE NOT NULL,   -- canicule, nuits_chaudes, stress_hydrique, biodiversite
  libelle   TEXT NOT NULL,
  unite     TEXT,
  famille   TEXT,
  source_id INT REFERENCES source(id)
);

CREATE TABLE scenario (
  id      SERIAL PRIMARY KEY,
  code    TEXT UNIQUE NOT NULL,     -- RCP4.5, RCP8.5
  libelle TEXT
);

CREATE TABLE projection (
  id           SERIAL PRIMARY KEY,
  code_insee   VARCHAR(5) REFERENCES commune(code_insee),
  indicateur_id INT REFERENCES indicateur(id),
  scenario_id  INT REFERENCES scenario(id),
  horizon      SMALLINT NOT NULL,   -- 2030, 2040, 2050
  valeur       NUMERIC NOT NULL
);
CREATE INDEX idx_projection_commune ON projection (code_insee);

CREATE TABLE levier_simulation (
  id          SERIAL PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL, -- vegetalisation
  libelle     TEXT,
  min         NUMERIC,
  max         NUMERIC,
  coefficient NUMERIC               -- effet par unité, modèle pédagogique
);
```

---

## 7. Pipeline d'ingestion

Exécuté hors temps réel. En production, l'API ne touche jamais aux portails sources : tout est pré-chargé.

```bash
# 1. Référentiel communes (géométries + drapeau littoral) via API Géo / BAN
python -m pipeline.01_communes

# 2. Lecture des fichiers DRIAS / DRIAS-Eau déposés dans data/raw/
python -m pipeline.02_extract_drias

# 3. Normalisation, agrégation par commune/horizon/scénario, calage Climadiag
python -m pipeline.03_transform

# 4. Chargement dans PostGIS
python -m pipeline.04_load
```

Pour le POC, le jeu de démo `data/seed/` suffit (voir checklist).

---

## 8. Documentation de l'API

Préfixe : `/api`. Réponses JSON. Mise en cache forte (les données évoluent rarement).

| Méthode et route | Description |
|---|---|
| `GET /api/communes/recherche?code_postal=59000` | Résout un code postal en une ou plusieurs communes |
| `GET /api/commune/{insee}?scenario=RCP4.5` | Indicateurs projetés d'une commune (2030/2040/2050) |
| `GET /api/commune/{insee}/simulation?vegetalisation=30&scenario=RCP4.5` | Effet du levier sur les indicateurs |
| `GET /api/sources` | Sources et licences, pour la transparence éditoriale |
| `GET /health` | Vérification de disponibilité |

### Exemple : indicateurs d'une commune

```http
GET /api/commune/59350?scenario=RCP4.5  →  200 OK
```
```json
{
  "commune":  { "insee": "59350", "nom": "Lille", "littoral": false },
  "scenario": "RCP4.5",
  "indicateurs": [
    { "code": "canicule", "libelle": "Jours de canicule", "unite": "jours/an",
      "horizons": { "2030": 9, "2040": 14, "2050": 21 }, "source": "DRIAS" },
    { "code": "nuits_chaudes", "libelle": "Nuits chaudes", "unite": "nuits/an",
      "horizons": { "2030": 12, "2040": 19, "2050": 30 }, "source": "DRIAS" }
  ]
}
```

### Exemple : simulation

```http
GET /api/commune/59350/simulation?vegetalisation=30&scenario=RCP4.5  →  200 OK
```
```json
{
  "commune": "59350", "scenario": "RCP4.5", "vegetalisation": 30,
  "reference": { "canicule_2050": 21 },
  "simule":    { "canicule_2050": 17 },
  "delta":     { "canicule_2050": -4 },
  "methode": "modele simplifie ilot de chaleur (pedagogique)"
}
```

Codes d'erreur : `400` paramètre invalide, `404` commune inconnue.

---

## 9. Tests

```bash
pytest -q
```

Couvrir au minimum pour le POC : la résolution code postal vers commune, la réponse indicateurs, et le calcul du simulateur.

---

## 10. Déploiement (Scaleway)

```bash
docker build -t climadata-api .
# base managée PostgreSQL + PostGIS sur Scaleway, conteneur déployé via le registre
```

CI/CD via GitHub Actions : lint, tests, build d'image, déploiement sur push de la branche `main`.
Penser à configurer `DATABASE_URL` et `CORS_ORIGINS` dans les secrets de l'environnement.

---

## 11. Checklist POC, jeudi soir

Périmètre minimal à démontrer côté back :

- [ ] Base PostGIS opérationnelle avec le schéma migré
- [ ] Jeu de démo chargé : environ 6 communes représentatives (par exemple Lille, Paris, Marseille, une commune côtière comme La Rochelle, une commune d'outre-mer)
- [ ] 3 indicateurs renseignés (canicule, stress hydrique, biodiversité) sur 3 horizons et 2 scénarios
- [ ] `GET /api/communes/recherche` fonctionnel
- [ ] `GET /api/commune/{insee}` renvoie les indicateurs attendus
- [ ] `GET /api/commune/{insee}/simulation` renvoie reference / simule / delta
- [ ] `GET /api/sources` renseigné (DRIAS, DRIAS-Eau, INPN, API Géo / BAN)
- [ ] CORS autorisant l'URL du front
- [ ] `/docs` accessible pour la démo
- [ ] README à jour et dépôt Git propre (commits lisibles)

Contrat partagé avec le front : le schéma de réponse de `/api/commune/{insee}` et `/simulation` ne doit pas changer sans prévenir, c'est l'interface entre les deux repos.