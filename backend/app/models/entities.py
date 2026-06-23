"""Tables : source, municipality, indicator, scenario, projection, simulation_lever."""
from __future__ import annotations

from sqlalchemy import ForeignKey, Index, Numeric, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Source(Base):
    __tablename__ = "source"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str | None] = mapped_column(Text)
    licence: Mapped[str | None] = mapped_column(Text)

    indicators: Mapped[list[Indicator]] = relationship(back_populates="source")


class Municipality(Base):
    __tablename__ = "municipality"

    insee_code: Mapped[str] = mapped_column(String(5), primary_key=True)
    postal_code: Mapped[str] = mapped_column(String(5), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    department: Mapped[str | None] = mapped_column(String(3))
    coastal: Mapped[bool] = mapped_column(default=False)
    # NB : la colonne `geom` (PostGIS) existe en base (migration) mais n'est pas
    # mappée ici, l'API ne l'expose pas.

    projections: Mapped[list[Projection]] = relationship(back_populates="municipality")

    __table_args__ = (Index("idx_municipality_pc", "postal_code"),)


class Indicator(Base):
    __tablename__ = "indicator"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    unit: Mapped[str | None] = mapped_column(Text)
    family: Mapped[str | None] = mapped_column(Text)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("source.id"))

    source: Mapped[Source | None] = relationship(back_populates="indicators")
    projections: Mapped[list[Projection]] = relationship(back_populates="indicator")


class Scenario(Base):
    __tablename__ = "scenario"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    label: Mapped[str | None] = mapped_column(Text)

    projections: Mapped[list[Projection]] = relationship(back_populates="scenario")


class Projection(Base):
    __tablename__ = "projection"

    id: Mapped[int] = mapped_column(primary_key=True)
    insee_code: Mapped[str] = mapped_column(
        String(5), ForeignKey("municipality.insee_code")
    )
    indicator_id: Mapped[int] = mapped_column(ForeignKey("indicator.id"))
    scenario_id: Mapped[int] = mapped_column(ForeignKey("scenario.id"))
    horizon: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # 2030/2040/2050
    value: Mapped[float] = mapped_column(Numeric, nullable=False)

    municipality: Mapped[Municipality] = relationship(back_populates="projections")
    indicator: Mapped[Indicator] = relationship(back_populates="projections")
    scenario: Mapped[Scenario] = relationship(back_populates="projections")

    __table_args__ = (Index("idx_projection_municipality", "insee_code"),)


class SimulationLever(Base):
    __tablename__ = "simulation_lever"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    label: Mapped[str | None] = mapped_column(Text)
    min: Mapped[float | None] = mapped_column(Numeric)
    max: Mapped[float | None] = mapped_column(Numeric)
    coefficient: Mapped[float | None] = mapped_column(Numeric)
