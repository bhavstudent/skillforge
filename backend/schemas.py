from pydantic import BaseModel, EmailStr
from datetime import datetime  
from typing import Optional, List

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

class ChatMessage(BaseModel):
    role: str
    content: str

class AIQuestionRequest(BaseModel):
    question: str
    marks: int
    history: Optional[List[ChatMessage]] = []

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

class ExplainRequest(BaseModel):
    question_id: int
    marks: int = 4
    language: str = "English"
    
    model_config = {"from_attributes": True}