import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Language, Lesson, Question

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/{language_code}")
def get_lessons(language_code: str, db: Session = Depends(get_db)):
    language = db.query(Language).filter(Language.code == language_code).first()
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")

    lessons = db.query(Lesson).filter(Lesson.language_id == language.id).order_by(Lesson.id).all()
    return [
        {
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "level": lesson.level,
        }
        for lesson in lessons
    ]


@router.get("/{language_code}/{lesson_id}")
def get_lesson(language_code: str, lesson_id: int, db: Session = Depends(get_db)):
    language = db.query(Language).filter(Language.code == language_code).first()
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.language_id == language.id if language else False,
    ).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    questions = db.query(Question).filter(Question.lesson_id == lesson.id).all()

    return {
        "id": lesson.id,
        "title": lesson.title,
        "description": lesson.description,
        "level": lesson.level,
        "questions": [
            {
                "id": q.id,
                "prompt": q.prompt,
                "question_type": q.question_type,
                "answer": q.answer,
                "options": json.loads(q.options) if q.options else [],
            }
            for q in questions
        ],
    }
