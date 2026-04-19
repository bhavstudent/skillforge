from backend.schemas import QuestionCreate, UserCreate
from backend.models import Question, User
from backend.security import hash_pwd
from sqlalchemy.orm import Session
import random

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.user_id == user_id).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        user_id=str(random.randint(10000, 99999)),
        name=user.name,
        email=user.email,
        password=hash_pwd(user.password),
        role=getattr(user, "role", "student"),
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id: str, update_data: dict):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    for key, value in update_data.items():
        if hasattr(user, key) and value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

def create_question(db: Session, question: QuestionCreate):
    new_q = Question(
        question_text=question.question_text,
        subject=question.subject,
        topic=question.topic,
        year=question.year,
        marks=question.marks,
        question_type=question.question_type,
        difficulty=question.difficulty
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

def get_all_que(db: Session):
    return db.query(Question).all()

def get_question_by_id(db: Session, question_id: int):
    return db.query(Question).filter(Question.id == question_id).first()