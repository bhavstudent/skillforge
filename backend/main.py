from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
import os
import pathlib


from datetime import datetime
from backend.schemas import UserCreate, UserResponse, LoginRequest, QuestionCreate, QuestionResponse
from backend.models import Base, User
from backend.database import get_db, engine
from backend import crud
from backend.security import verify_pwd, create_token, get_current_user, verify_credentials
from backend.ai_logic import recommend_next
from backend.routers import ai, tasks, activity, progress, profile

app = FastAPI(title="SkillForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "backend/uploads")
os.makedirs(f"{UPLOAD_DIR}/profiles", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/pdfs", exist_ok=True)

if pathlib.Path(UPLOAD_DIR).exists():
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "SkillForge API is live"}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(400, "Email already registered")
    return crud.create_user(db, user_in)

@app.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = verify_credentials(db, req.email, req.password)
    if not user:
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user.user_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
    }

@app.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/questions", response_model=QuestionResponse)
def add_question(q: QuestionCreate, db: Session = Depends(get_db)):
    return crud.create_question(db, q)

@app.get("/questions", response_model=List[QuestionResponse])
def list_questions(db: Session = Depends(get_db)):
    return crud.get_all_que(db)

@app.post("/recommend")
def recommend(data: dict):
    return {"recommendation": recommend_next(data)}

app.include_router(ai.router)
app.include_router(tasks.router)
app.include_router(activity.router)
app.include_router(progress.router)
app.include_router(profile.router)

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

@app.get("/.well-known/{path:path}", include_in_schema=False)
async def well_known(path: str):
    return Response(status_code=204)