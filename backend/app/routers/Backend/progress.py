from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Progress
from ..schemas import ProgressIn, ProgressOut

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/{user_id}/{language_code}", response_model=ProgressOut | None)
def get_progress(user_id: str, language_code: str, db: Session = Depends(get_db)):
    return db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.language_code == language_code,
    ).first()


@router.post("", response_model=ProgressOut)
def save_progress(payload: ProgressIn, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter(
        Progress.user_id == payload.user_id,
        Progress.language_code == payload.language_code,
    ).first()

    if not progress:
        progress = Progress(**payload.model_dump())
        db.add(progress)
    else:
        progress.xp = payload.xp
        progress.streak = payload.streak
        progress.completed_lessons = payload.completed_lessons

    db.commit()
    db.refresh(progress)
    return progress
