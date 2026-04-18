from backend.schemas import QuestionCreate, UserCreate
from backend.models import Question, User
import random
from sqlalchemy.orm import Session
from backend.security import hash_pwd

def get_user_by_email(db: Session, email: str):
    """Helper: Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.user_id == user_id).first()

def create_user(db: Session, user: UserCreate):
    # ✅ Check if email already exists
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError("Email already registered")
    
    password = hash_pwd(user.password)
    role = getattr(user, 'role', 'user')
    
    db_user = User(
        user_id=str(random.randint(10000, 99999)),
        name=user.name,
        email=user.email,
        password=password,
        role=role,
        is_active=True  # ✅ Boolean True, not string "active"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id:str, update_data: dict):
    db_user = get_user_by_id(db,user_id)
    if not db_user:
        return None

    for key, value in update_data.items():
        if hasattr(db_user, key) and value is not None:
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def create_question(db: Session, question: QuestionCreate):
    new_question = Question(
        question_text=question.question_text,
        subject=question.subject,
        topic=question.topic,
        year=question.year,
        marks=question.marks,
        question_type=question.question_type,
        difficulty=question.difficulty
    )
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question

def get_all_que(db: Session):
    return db.query(Question).all()