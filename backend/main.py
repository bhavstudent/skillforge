from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
import os

# ✅ FIXED: All imports relative to backend/ directory (no 'backend.' prefix)
from schemas import UserCreate, UserResponse, LoginRequest, TokenResponse, QuestionCreate, QuestionResponse
from models import Base, User, Question, Progress
from database import get_db, engine, init_db
from crud import create_user, get_user_by_email, verify_credentials, create_question, get_all_questions
from security import verify_pwd, create_token, get_current_user
from ai_logic import recommend_next

# Import routers
from routers import ai, tasks, activity, progress, profile

# ✅ Create FastAPI app
app = FastAPI(
    title="SkillForge API",
    description="AI-powered job-ready learning platform",
    version="1.0.0"
)

# ✅ CORS - Allow your frontend origins
FRONTEND_URLS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Static files for profile uploads
os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ✅ Initialize database tables
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    init_db()  # If you have seed data function

# ============ PUBLIC ENDPOINTS ============
@app.get("/")
def root():
    return {"message": "🚀 SkillForge API is live", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "skillforge-api"}

# ============ AUTH ENDPOINTS ============
@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user_in)

@app.post("/login")
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = verify_credentials(db, login_req.email, login_req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
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

# ============ QUESTIONS ============
@app.post("/questions", response_model=QuestionResponse)
def create_q(question: QuestionCreate, db: Session = Depends(get_db)):
    return create_question(db, question)

@app.get("/questions", response_model=List[QuestionResponse])
def list_q(db: Session = Depends(get_db)):
    return get_all_questions(db)

# ============ AI RECOMMENDATION ============
@app.post("/recommend")
def get_recommendation(progress: dict):
    return {"recommendation": recommend_next(progress)}

# ============ INCLUDE ROUTERS ============
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(activity.router, prefix="/api/activity", tags=["Activity"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])

# ============ UTILITY ENDPOINTS ============
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

@app.get("/.well-known/appspecific/com.chrome.devtools.json", include_in_schema=False)
async def devtools_config():
    return Response(status_code=204)

# ============ RUN (for local only) ============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)