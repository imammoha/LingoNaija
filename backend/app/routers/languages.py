from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Language
from ..schemas import LanguageOut

router = APIRouter(prefix="/languages", tags=["languages"])


@router.get("", response_model=list[LanguageOut])
def get_languages(db: Session = Depends(get_db)):
    return db.query(Language).order_by(Language.name).all()
