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

# Au démarrage : migrations Alembic, seed idempotent, puis l'API.
# Railway injecte $PORT dynamiquement ; repli sur 8000 en local.
CMD ["sh", "-c", "alembic upgrade head && python -m pipeline.load --seed && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
