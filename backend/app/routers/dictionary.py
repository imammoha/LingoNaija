from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Language, DictionaryWord
from ..schemas import WordOut

router = APIRouter(prefix="/dictionary", tags=["dictionary"])


@router.get("/{language_code}", response_model=list[WordOut])
def get_dictionary(
    language_code: str,
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    language = db.query(Language).filter(Language.code == language_code).first()
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")

    query = db.query(DictionaryWord).filter(DictionaryWord.language_id == language.id)
    if q:
        pattern = f"%{q.strip()}%"
        query = query.filter(
            (DictionaryWord.word.ilike(pattern))
            | (DictionaryWord.meaning.ilike(pattern))
            | (DictionaryWord.category.ilike(pattern))
        )

    return query.order_by(DictionaryWord.word).all()
