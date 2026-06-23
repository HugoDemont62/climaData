"""Fixtures de test : base SQLite temporaire peuplée du jeu de démo."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401  (enregistre les tables sur Base.metadata)
from app.database import Base, get_db
from app.main import app
from pipeline.load import load_seed


@pytest.fixture()
def client(tmp_path):
    db_file = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite+pysqlite:///{db_file}", connect_args={"check_same_thread": False}
    )
    TestingSession = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False
    )

    Base.metadata.create_all(bind=engine)
    with TestingSession() as db:
        load_seed(db)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
