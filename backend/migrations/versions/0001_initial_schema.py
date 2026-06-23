"""Schéma initial ClimaData (PostgreSQL + PostGIS).

Reprend le modèle physique du README (section 6) : la colonne `geom` PostGIS est
créée ici alors qu'elle n'est pas mappée dans l'ORM (utilisée par le pipeline).

Revision ID: 0001
Revises:
Create Date: 2026-06-23
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _postgis_available() -> bool:
    """PostGIS est l'extension cible du projet, mais on tolère son absence.

    Si elle n'est pas disponible, la colonne géométrique est simplement omise :
    l'API n'expose pas la géométrie et la recherche se fait sur le code postal.
    Le schéma reste donc opérationnel sur un PostgreSQL sans PostGIS.
    """
    bind = op.get_bind()
    return bool(
        bind.execute(
            sa.text("SELECT count(*) FROM pg_available_extensions WHERE name = 'postgis'")
        ).scalar()
    )


def upgrade() -> None:
    has_postgis = _postgis_available()
    if has_postgis:
        op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    op.execute(
        """
        CREATE TABLE source (
          id        SERIAL PRIMARY KEY,
          name      TEXT NOT NULL,
          url       TEXT,
          licence   TEXT
        );
        """
    )

    geom_column = "geom GEOMETRY(MultiPolygon, 4326)" if has_postgis else ""
    op.execute(
        f"""
        CREATE TABLE municipality (
          insee_code   VARCHAR(5) PRIMARY KEY,
          postal_code  VARCHAR(5) NOT NULL,
          name         TEXT NOT NULL,
          department   VARCHAR(3),
          coastal      BOOLEAN DEFAULT FALSE{"," if geom_column else ""}
          {geom_column}
        );
        """
    )
    op.execute("CREATE INDEX idx_municipality_pc ON municipality (postal_code);")
    if has_postgis:
        op.execute(
            "CREATE INDEX idx_municipality_geom ON municipality USING GIST (geom);"
        )

    op.execute(
        """
        CREATE TABLE indicator (
          id        SERIAL PRIMARY KEY,
          code      TEXT UNIQUE NOT NULL,
          label     TEXT NOT NULL,
          unit      TEXT,
          family    TEXT,
          source_id INT REFERENCES source(id)
        );
        """
    )

    op.execute(
        """
        CREATE TABLE scenario (
          id      SERIAL PRIMARY KEY,
          code    TEXT UNIQUE NOT NULL,
          label   TEXT
        );
        """
    )

    op.execute(
        """
        CREATE TABLE projection (
          id             SERIAL PRIMARY KEY,
          insee_code     VARCHAR(5) REFERENCES municipality(insee_code),
          indicator_id   INT REFERENCES indicator(id),
          scenario_id    INT REFERENCES scenario(id),
          horizon        SMALLINT NOT NULL,
          value          NUMERIC NOT NULL
        );
        """
    )
    op.execute("CREATE INDEX idx_projection_municipality ON projection (insee_code);")

    op.execute(
        """
        CREATE TABLE simulation_lever (
          id           SERIAL PRIMARY KEY,
          code         TEXT UNIQUE NOT NULL,
          label        TEXT,
          min          NUMERIC,
          max          NUMERIC,
          coefficient  NUMERIC
        );
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS projection;")
    op.execute("DROP TABLE IF EXISTS simulation_lever;")
    op.execute("DROP TABLE IF EXISTS indicator;")
    op.execute("DROP TABLE IF EXISTS scenario;")
    op.execute("DROP TABLE IF EXISTS municipality;")
    op.execute("DROP TABLE IF EXISTS source;")
