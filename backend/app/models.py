from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    progress = relationship(
        "Progress",
        back_populates="user",
        cascade="all, delete-orphan"
    )
class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    region = Column(String(100), nullable=False)
    words = relationship(
        "DictionaryWord",
        back_populates="language",
        cascade="all, delete-orphan"
    )
    lessons = relationship(
        "Lesson",
        back_populates="language",
        cascade="all, delete-orphan"
    )
class DictionaryWord(Base):
    __tablename__ = "dictionary_words"
    id = Column(Integer, primary_key=True)
    word = Column(String(200), nullable=False, index=True)
    meaning = Column(String(500), nullable=False)
    example = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    language = relationship("Language", back_populates="words")
class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    level = Column(String(50), nullable=False)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    language = relationship("Language", back_populates="lessons")
    questions = relationship(
        "Question",
        back_populates="lesson",
        cascade="all, delete-orphan"
    )
class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    prompt = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)
    answer = Column(String(500), nullable=False)
    options = Column(Text, nullable=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    lesson = relationship("Lesson", back_populates="questions")
class Progress(Base):
    __tablename__ = "progress"
    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    language_code = Column(String(20), nullable=False)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    completed_lessons = Column(Integer, default=0)
    user = relationship("User", back_populates="progress")