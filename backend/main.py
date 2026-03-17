from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os

from backend.schemas import UserCreate, UserResponse, LoginRequest, TokenResponse
from backend.models import Base, User
from backend import crud, schemas
from backend.database import get_db, engine
from backend.ai_logic import recommend_next
from backend.routers import ai, tasks, activity, progress, profile
from backend.security import verify_pwd, create_token, get_current_user

app = FastAPI(title="AI Academic & Coding Platform")

# ✅ CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("backend/uploads/profiles", exist_ok = True)
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

# Create DB tables
Base.metadata.create_all(bind=engine)

# ----------- HOME ------------
@app.get("/")
def home():
    return {"message": "Welcome to AI Coding Platform"}

@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend is running! 🚀"}

# ----------- AUTH ------------
@app.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user or not verify_pwd(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_token(user_id = db_user.user_id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": db_user.user_id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "is_active": db_user.is_active,
            "created_at": db_user.created_at
        }
    }

@app.get("/me", response_model= UserResponse)
def who_am_i(current_user = Depends(get_current_user)):
    return current_user

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

# ----------- QUESTIONS ------------
@app.post("/questions", response_model=schemas.QuestionResponse)
def add_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    return crud.create_question(db, question)

@app.get("/questions", response_model=List[schemas.QuestionResponse])
def list_questions(db: Session = Depends(get_db)):
    return crud.get_all_que(db)

# ----------- AI RECOMMENDATION ------------
@app.post("/recommend")
def recommend(progress_data: dict):
    recommendation = recommend_next(progress_data)
    return {"recommendation": recommendation}

# ----------- ROUTERS ------------
app.include_router(ai.router)
app.include_router(tasks.router)
app.include_router(activity.router)
app.include_router(progress.router)
app.include_router(profile.router)

# ----------- RUN ------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)