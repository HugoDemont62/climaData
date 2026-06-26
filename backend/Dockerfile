FROM python:3.13-slim

WORKDIR /app

# Dépendances système minimales pour psycopg / geoalchemy2
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Au démarrage : migrations Alembic + seed idempotent, puis l'API.
# Les étapes DB sont tolérantes aux erreurs (loggées mais NON bloquantes) afin
# que l'API démarre toujours et ne renvoie pas de 502. Railway injecte $PORT.
CMD ["sh", "-c", "alembic upgrade head || echo '>>> ALEMBIC FAILED (voir erreur ci-dessus)'; python -m pipeline.load --drias || echo '>>> DRIAS LOAD FAILED (voir erreur ci-dessus)'; uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
