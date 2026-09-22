from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
class UserLogin(BaseModel):
    email: EmailStr
    password: str
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: EmailStr
class LoginResponse(BaseModel):
    message: str
    user: UserOut
class LanguageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    code: str
    region: str
class WordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    word: str
    meaning: str
    example: Optional[str] = None
    category: Optional[str] = None
    language_id: int
class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    prompt: str
    question_type: str
    answer: str
    options: Optional[str] = None
    lesson_id: int
class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str
    level: str
    language_id: int
    questions: list[QuestionOut] = []
class ProgressIn(BaseModel):
    user_id: int
    language_code: str
    xp: int = 0
    streak: int = 0
    completed_lessons: int = 0
class ProgressOut(ProgressIn):
    id: int
    model_config = ConfigDict(from_attributes=True)