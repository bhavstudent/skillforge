from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "student"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    user_id: str
    is_active: bool
    created_at: datetime
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    profile_image: Optional[str] = None
    is_public: Optional[bool] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class QuestionBase(BaseModel):
    question_text: str
    subject: str
    topic: str
    year: int
    marks: int
    question_type: Optional[str] = None
    difficulty: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

class ProgressUpdate(BaseModel):
    topic: str
    skill_level: int = Field(..., ge=0, le=100)
    completed: bool = False
    notes: Optional[str] = None
    time_spent_minutes: Optional[int] = None

class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    topic: str
    skill_level: int
    completed: bool
    updated_at: datetime

class AIQuestionRequest(BaseModel):
    question: str
    marks: int
    history: Optional[List[dict]] = []

class ExplainRequest(BaseModel):
    question_id: int
    marks: int
    language: Optional[str] = None