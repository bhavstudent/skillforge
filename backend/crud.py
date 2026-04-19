from schemas import QuestionCreate, UserCreate
from models import Question, User
import random
from sqlalchemy.orm import Session
from security import hash_pwd

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.user_id == user_id).first()

def create_user(db: Session, user: UserCreate):
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError("Email already registered")
    
    db_user = User(
        user_id=str(random.randint(10000, 99999)),
        name=user.name,
        email=user.email,
        password=hash_pwd(user.password),
        role=user.role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id: str, update_data: dict):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    for key, value in update_data.items():
        if hasattr(db_user, key) and value is not None:
            setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_question(db: Session, question: QuestionCreate, user_id: int = None):
    new_question = Question(**question.model_dump())
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question

def get_all_que(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Question).offset(skip).limit(limit).all()

def get_question_by_id(db: Session, question_id: int):
    return db.query(Question).filter(Question.id == question_id).first()

def update_progress(db: Session, user_id: int, progress):
    # Stub for now - extend as needed
    return {"message": "Progress updated", "user_id": user_id, "data": progress.model_dump()}

def get_user_progress(db: Session, user_id: int):
    return {"total_questions": 0, "completed": 0, "avg_level": 0, "topics": []}