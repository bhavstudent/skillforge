from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "student"

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    profile_image: Optional[str] = None
    is_public: Optional[bool] = None
    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class QuestionCreate(BaseModel):
    question_text: str
    subject: str
    topic: str
    year: int
    marks: int
    question_type: Optional[str] = None
    difficulty: Optional[str] = None

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    subject: str
    topic: str
    year: int
    marks: int
    difficulty: Optional[str] = None
    model_config = {"from_attributes": True}

class ChatMessage(BaseModel):
    role: str
    content: str

class AIQuestionRequest(BaseModel):
    question: str
    marks: int
    history: Optional[List[ChatMessage]] = []

class ExplainRequest(BaseModel):
    question_id: int
    marks: int = 4
    language: Optional[str] = "English"
    model_config = {"from_attributes": True}