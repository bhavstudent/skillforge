from backend.database import Base
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Boolean
from datetime import datetime

class Question(Base):
    __tablename__ = "questions"  # ✅ DOUBLE underscore
    
    question_id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    university = Column(String, default="SPPU")
    year = Column(Integer, nullable=False)
    marks = Column(Integer, nullable=False)
    question_type = Column(String)
    difficulty = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"  # ✅ DOUBLE underscore
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(5), unique=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # ✅ REMOVED: unique=True
    
    # ✅ FIXED: Added defaults + correct types
    role = Column(String, default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)  # ✅ Boolean
    
    bio = Column(Text, nullable=True)
    location = Column(String, nullable= True)
    website = Column(String, nullable=True)
    github = Column(String, nullable=True)
    linkedin = Column(String, nullable= True)
    profile_image = Column(String, nullable= True)
    is_public = Column(Boolean, default = True, nullable= True)

    created_at = Column(DateTime, default=datetime.utcnow)

class Dailytask(Base):
    __tablename__ = "daily_tasks"  # ✅ DOUBLE underscore
    
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    language = Column(String, nullable=False)  # ✅ Fixed typo (was langauge)
    difficulty = Column(String)
    description = Column(String)
    day_number = Column(Integer)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class ActivityLog(Base):
    __tablename__ = "activity_logs"  # ✅ DOUBLE underscore
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    task_id = Column(Integer, ForeignKey("daily_tasks.id"))
    date = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)

class UserProgress(Base):
    __tablename__ = "user_progress"  # ✅ Already correct
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    language = Column(String)  # ✅ Fixed typo (was langauge)
    percentage = Column(Integer)