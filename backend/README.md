# ClimaData — API & Moteur de données

Moteur de données géolocalisées et API climat de ClimaData.
Responsable : Hugo Potier.

Ce service ingère les projections climatiques publiques, les structure dans une base géospatiale, et expose une API légère qui sert au front les indicateurs d'une commune à partir de son code postal, aux horizons 2030, 2040 et 2050.

---

## 1. Stack

- **Python 3.13**
- **FastAPI** (API REST asynchrone)
- **PostgreSQL 16 + PostGIS** (stockage géospatial)
- **SQLAlchemy** + **Alembic** (ORM et migrations)
- **httpx** (appels API Géo / Base Adresse Nationale)
- **pandas** / **xarray** (lecture des fichiers DRIAS netCDF/CSV)
- **uvicorn** (serveur ASGI)
- **pytest** (tests)
- Hébergement cible : **Railway**

---

## 2. Prérequis

- Python 3.13 et `pip`
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
│       ├── queries.py       # accès aux données (lecture)
│       └── simulateur.py    # modèle simplifié îlot de chaleur
├── pipeline/
│   ├── extract_drias.py     # parsing des exports DRIAS + rattachement commune
│   └── load.py              # chargement en base (`--seed` démo, `--drias` réel)
├── data/
│   ├── raw/                 # fichiers DRIAS bruts (non versionnés)
│   └── seed/                # jeu de démo POC
│       └── dataset.py       # 6 communes, 4 indicateurs, 2 scénarios, 3 horizons
├── migrations/              # Alembic (0001 : schéma + PostGIS)
├── tests/                   # pytest (simulateur + endpoints)
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
#    L'activation de PostGIS exige un superuser : à faire une fois si le rôle
#    applicatif n'en est pas un (sinon la migration la fait automatiquement).
psql -d climadata -c "CREATE EXTENSION IF NOT EXISTS postgis;"   # par un superuser
alembic upgrade head

# 5. Données : jeu de démo synthétique, ou projections réelles DRIAS (data/raw/)
python -m pipeline.load --seed     # démo
python -m pipeline.load --drias    # réel

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

Modèle physique simplifié, orienté restitution. Schéma de référence ci-dessous.

> La migration Alembic (`migrations/versions/0001_*`) crée l'extension PostGIS et la
> colonne `geom` **si PostGIS est disponible**. À défaut (PostgreSQL sans PostGIS),
> elle omet `geom` et le reste du schéma reste opérationnel : l'API n'expose pas la
> géométrie et la recherche se fait sur le code postal indexé.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE source (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  url       TEXT,
  licence   TEXT
);

CREATE TABLE municipality (
  insee_code   VARCHAR(5) PRIMARY KEY,
  postal_code  VARCHAR(5) NOT NULL,
  name         TEXT NOT NULL,
  department   VARCHAR(3),
  coastal      BOOLEAN DEFAULT FALSE,
  geom         GEOMETRY(MultiPolygon, 4326)
);
CREATE INDEX idx_municipality_pc ON municipality (postal_code);
CREATE INDEX idx_municipality_geom ON municipality USING GIST (geom);

CREATE TABLE indicator (
  id        SERIAL PRIMARY KEY,
  code      TEXT UNIQUE NOT NULL,   -- canicule, nuits_chaudes, stress_hydrique, biodiversite
  label     TEXT NOT NULL,
  unit      TEXT,
  family    TEXT,
  source_id INT REFERENCES source(id)
);

CREATE TABLE scenario (
  id      SERIAL PRIMARY KEY,
  code    TEXT UNIQUE NOT NULL,     -- RCP4.5, RCP8.5
  label   TEXT
);

CREATE TABLE projection (
  id             SERIAL PRIMARY KEY,
  insee_code     VARCHAR(5) REFERENCES municipality(insee_code),
  indicator_id   INT REFERENCES indicator(id),
  scenario_id    INT REFERENCES scenario(id),
  horizon        SMALLINT NOT NULL,   -- 2030, 2040, 2050
  value          NUMERIC NOT NULL
);
CREATE INDEX idx_projection_municipality ON projection (insee_code);

CREATE TABLE simulation_lever (
  id           SERIAL PRIMARY KEY,
  code         TEXT UNIQUE NOT NULL, -- vegetalisation, desimpermeabilisation
  label        TEXT,
  min          NUMERIC,
  max          NUMERIC,
  coefficient  NUMERIC               -- effect per unit, pedagogical model
);
```

---

## 7. Pipeline d'ingestion

Exécuté hors temps réel. En production, l'API ne touche jamais aux portails sources : tout est pré-chargé.

```bash
# Jeu de démonstration synthétique (aucune dépendance externe)
python -m pipeline.load --seed

# Projections réelles depuis les exports DRIAS déposés dans data/raw/
python -m pipeline.load --drias
```

`--drias` lit les exports `indicesQ50_*.txt` (DRIAS chaleur + DRIAS-Eau SIM2),
rattache chaque commune au **point de grille le plus proche** de son centroïde, mappe
les horizons H1/H2/H3 sur 2030/2040/2050, et convertit les indices :

| Indice DRIAS | Indicateur ClimaData | Transformation |
|---|---|---|
| `NORTX35` (jours TX > 35 °C) | `canicule` | valeur arrondie |
| `NORTR` (nuits tropicales) | `nuits_chaudes` | valeur arrondie |
| `NORSWIAV` (humidité des sols 0-1) | `stress_hydrique` | `(1 − SWI) × 100` |

Repli automatique sur le jeu de démo pour ce que DRIAS ne couvre pas : la
biodiversité (proxy INPN, pas de projection DRIAS) et les communes hors domaine
EUROCORDEX (outre-mer, p. ex. Fort-de-France). Le référentiel géométrique des
communes via API Géo / BAN reste à intégrer (sprint 3) pour un rattachement par
intersection plutôt que par plus proche point.

---

## 8. Documentation de l'API

Préfixe : `/api`. Réponses JSON. Mise en cache forte (les données évoluent rarement).

| Méthode et route                                                        | Description |
|-------------------------------------------------------------------------|---|
| `GET /api/municipalities/search?code_postal=59000`                      | Résout un code postal en une ou plusieurs communes |
| `GET /api/municipalities/{insee}?scenario=RCP4.5`                              | Indicateurs projetés d'une commune (2030/2040/2050) |
| `GET /api/municipalities/{insee}/simulation?vegetalisation=30&scenario=RCP4.5` | Effet du levier sur les indicateurs |
| `GET /api/sources`                                                      | Sources et licences, pour la transparence éditoriale |
| `GET /health`                                                           | Vérification de disponibilité |

### Exemple : indicateurs d'une commune

```http
GET /api/municipalities/59350?scenario=RCP4.5  →  200 OK
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
GET /api/municipalities/59350/simulation?vegetalisation=30&scenario=RCP4.5  →  200 OK
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

### Couverture fonctionnelle (user stories)

Traçabilité avec le backlog du dossier individuel (Bloc 2.2) :

| US  | Besoin                                          | Couverture                                  | Priorité / Sprint |
|-----|-------------------------------------------------|---------------------------------------------|-------------------|
| US2 | Résoudre un code postal en commune              | `GET /api/municipalities/search`            | Must / 1          |
| US3 | Ingérer les projections DRIAS dans PostGIS      | Pipeline d'ingestion (section 7)            | Must / 1          |
| US1 | Indicateurs projetés d'une commune              | `GET /api/municipalities/{insee}`           | Must / 1          |
| US6 | Chaque indicateur porte sa source               | Modèle `source` + `GET /api/sources`        | Must / 1          |
| US4 | Coefficients du simulateur                       | `GET /api/municipalities/{insee}/simulation`| Should / 3        |
| US5 | Drapeau littoral et montée des eaux              | Champ `coastal` de `municipality`           | Should / 3        |

---

## 9. Conformité et sobriété

Engagements portés par le composant (cf. dossier ClimaData, blocs 1.2 et 2.1) :

- **RGPD.** Aucune authentification pour consulter. Le code postal sert à résoudre la commune puis n'est pas conservé à des fins d'identification ; aucune requête utilisateur n'est journalisée à cette fin.
- **Hébergement UE.** Données et API hébergées dans l'Union européenne (Railway), sans transfert hors UE.
- **Sobriété.** Agrégats pré-calculés à l'ingestion (aucun calcul lourd à la requête), mise en cache forte (les données évoluent rarement) et réponses JSON légères par commune.
- **Traçabilité.** Chaque valeur projetée est rattachée à sa source (`GET /api/sources`) pour l'affichage de la provenance côté front.

---

## 10. Tests

```bash
pytest -q
```

Couvrir au minimum pour le POC : la résolution code postal vers commune, la réponse indicateurs, et le calcul du simulateur.

---

## 11. Déploiement (Railway)

```bash
docker build -t climadata-api .
# base managée PostgreSQL + PostGIS sur Railway, conteneur déployé via le registre
```

CI/CD via GitHub Actions : lint, tests, build d'image, déploiement sur push de la branche `main`.
Penser à configurer `DATABASE_URL` et `CORS_ORIGINS` dans les secrets de l'environnement.

---

## 12. Checklist POC, jeudi soir

Périmètre minimal à démontrer côté back :

- [ ] Base PostGIS opérationnelle avec le schéma migré
- [ ] Jeu de démo chargé : environ 6 communes représentatives (par exemple Lille, Paris, Marseille, une commune côtière comme La Rochelle, une commune d'outre-mer)
- [ ] 3 familles d'indicateurs renseignées — canicule (codes `canicule` et `nuits_chaudes`), eau (`stress_hydrique`) et biodiversité (`biodiversite`) — sur 3 horizons et 2 scénarios
- [ ] `GET /api/municipalities/search` fonctionnel
- [ ] `GET /api/municipalities/{insee}` renvoie les indicateurs attendus
- [ ] `GET /api/municipalities/{insee}/simulation` renvoie reference / simule / delta
- [ ] `GET /api/sources` renseigné (DRIAS, DRIAS-Eau, INPN, API Géo / BAN)
- [ ] CORS autorisant l'URL du front
- [ ] `/docs` accessible pour la démo
- [ ] README à jour et dépôt Git propre (commits lisibles)

Contrat partagé avec le front : le schéma de réponse de `/api/municipalities/{insee}` et `/simulation` ne doit pas changer sans prévenir, c'est l'interface entre les deux repos.