from pydantic import BaseModel, EmailStr
from datetime import datetime  
from typing import Optional

class QuestionCreate(BaseModel):
    question_text: str
    subject: str
    topic: str
    year: int
    marks: int
    question_type: str
    difficulty: str

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    subject: str
    topic: str
    year: int  
    marks: int  
    difficulty: str
    
    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AIQuestionRequest(BaseModel):
    question: str
    marks: int

class TaskResponse(BaseModel):  # ✅ Fixed typo: was "TaskRespose"
    id: int
    title: str
    language: str
    difficulty: str
    description: str

class ActivityResponse(BaseModel):  # ✅ Fixed typo: was "AcivityResponse"
    user_id: int
    task_id: int
    completed: bool

class ProgressResponse(BaseModel):
    language: str
    percentage: int

    model_config = {"from_attributes": True}
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    model_config = {"from_attributes": True}