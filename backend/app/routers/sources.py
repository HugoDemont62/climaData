"""Sources et licences, pour la transparence éditoriale (US6)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Source
from app.schemas import SourceOut

router = APIRouter(prefix="/api/sources", tags=["sources"])


@router.get("", response_model=list[SourceOut])
def list_sources(db: Session = Depends(get_db)) -> list[SourceOut]:
    sources = db.scalars(select(Source).order_by(Source.name))
    return [SourceOut(name=s.name, url=s.url, licence=s.licence) for s in sources]
