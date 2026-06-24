"""Session SQLAlchemy. PostGIS en production, portable pour les tests.

La géométrie communale (colonne `geom`, PostGIS) n'est volontairement pas mappée
dans l'ORM : l'API ne renvoie jamais de géométrie et la recherche se fait sur le
code postal indexé. Cela rend les modèles portables (PostgreSQL ou SQLite de test)
tout en laissant la migration Alembic créer la colonne PostGIS en production.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()

# check_same_thread n'est utile que pour SQLite (tests / démarrage à vide).
connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)

engine = create_engine(settings.sqlalchemy_url, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
