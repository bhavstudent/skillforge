from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response, FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from datetime import datetime

from schemas import UserCreate, UserResponse, LoginRequest, TokenResponse, QuestionCreate, QuestionResponse, ProgressUpdate
from models import Base, User, Question
from database import get_db, engine, init_db
from crud import create_user, get_user_by_email, verify_credentials, create_question, get_all_que, get_question_by_id, update_progress, get_user_progress
from security import verify_pwd, create_token, get_current_user
from ai_logic import recommend_next
from pdf_service import generate_pdf
from routers import activity, tasks, profile, progress, ai_router

app = FastAPI(title="SkillForge API", description="AI-powered job-ready learning platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

os.makedirs("uploads/profiles", exist_ok=True)
os.makedirs("uploads/pdfs", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {"message": "🚀 SkillForge API is live", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(400, "Email already registered")
    return create_user(db, user_in)

@app.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = verify_credentials(db, req.email, req.password)
    if not user: raise HTTPException(401, "Invalid credentials")
    return {"access_token": create_token(user.user_id), "token_type": "bearer", "user": user}

@app.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/questions", response_model=QuestionResponse)
def add_q(q: QuestionCreate, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return create_question(db, q, u.id)

@app.get("/questions", response_model=List[QuestionResponse])
def list_q(db: Session = Depends(get_db)):
    return get_all_que(db)

@app.post("/recommend")
def recommend(data: dict, u: User = Depends(get_current_user)):
    return {"recommendation": recommend_next(data)}

# Routers
app.include_router(ai_router, prefix="/api")
app.include_router(tasks_router)
app.include_router(activity_router)
app.include_router(progress_router)
app.include_router(profile_router)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon(): return Response(status_code=204)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)