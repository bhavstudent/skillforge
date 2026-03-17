from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
import uuid
import os

from backend.database import get_db
from backend.models import User, ActivityLog, Dailytask
from backend import crud

router = APIRouter(prefix="/profile", tags=["Profile"])


# -----------------------------
# Pydantic model for updates
# -----------------------------
class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    is_public: Optional[bool] = None


# -----------------------------
# Get profile
# -----------------------------
@router.get("/{user_id}")
def get_profile(user_id: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_solved = db.query(ActivityLog).filter(
        ActivityLog.user_id == user.id,
        ActivityLog.completed == True
    ).count()

    current_streak = calculate_streak(user.id, db)
    languages = get_language_progress(user.id, db)

    return {
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "bio": user.bio,
            "location": user.location,
            "website": user.website,
            "github": user.github,
            "linkedin": user.linkedin,
            "profile_image": user.profile_image,
            "is_public": user.is_public,
            "created_at": user.created_at
        },
        "stats": {
            "problemsSolved": total_solved,
            "currentStreak": current_streak,
            "languagesLearned": len([l for l in languages if l["percentage"] > 0]),
            "totalXP": total_solved * 50
        },
        "languages": languages
    }


# -----------------------------
# Update profile
# -----------------------------
@router.put("/{user_id}")
def update_profile(
    user_id: str,
    data: ProfileUpdate,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = data.dict(exclude_unset=True)

    updated_user = crud.update_user_profile(db, user_id, update_data)

    return {
        "message": "Profile updated successfully",
        "user": {
            "user_id": updated_user.user_id,
            "name": updated_user.name,
            "bio": updated_user.bio,
            "location": updated_user.location,
            "website": updated_user.website,
            "github": updated_user.github,
            "linkedin": updated_user.linkedin,
            "profile_image": updated_user.profile_image,
            "is_public": updated_user.is_public
        }
    }

@router.post("/{user_id}/uploaded-photo")
async def upload_profile_photo(
    user_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload profile photo"""
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail= "User not found")
    
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: JPEG, PNG, WEBP"
        )
    
    file_size = 0
    content = await file.read()
    file_size = len(content)
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Max size: 5MB"
        )
    
    UPLOAD_DIR = "backend/uploads/profiles"
    file_extension = file.filename.split(".")[-1] if "."in file.filename else "jpg"
    unique_filename = f"{user_id}_{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    profile_image_url = f"/uploads/profiles/{unique_filename}"

    update_data = {"profile_image": profile_image_url}
    updated_user = crud.update_user_profile(db, user_id, update_data)

    return {
        "message": "Photo uploaded successfullt",
        "profile_image": profile_image_url
    }

# -----------------------------
# Achievements
# -----------------------------
@router.get("/{user_id}/achievements")
def get_achievements(user_id: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_solved = db.query(ActivityLog).filter(
        ActivityLog.user_id == user.id,
        ActivityLog.completed == True
    ).count()

    streak = calculate_streak(user.id, db)

    achievements = []

    if total_solved >= 1:
        achievements.append({
            "id": 1,
            "title": "First Problem Solved",
            "description": "Solved your first problem",
            "xp": 100,
            "unlocked": True
        })

    if streak >= 7:
        achievements.append({
            "id": 2,
            "title": "On Fire",
            "description": "7 day streak",
            "xp": 500,
            "unlocked": True
        })

    if total_solved >= 100:
        achievements.append({
            "id": 3,
            "title": "Problem Solver",
            "description": "Solved 100 problems",
            "xp": 3000,
            "unlocked": True
        })

    return achievements


# -----------------------------
# Streak calculation
# -----------------------------
def calculate_streak(user_id: int, db: Session):

    from datetime import datetime

    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == user_id,
        ActivityLog.completed == True
    ).order_by(ActivityLog.date.desc()).all()

    if not activities:
        return 0

    streak = 0
    today = datetime.utcnow().date()

    for i, activity in enumerate(activities):

        if i == 0:
            days_diff = (today - activity.date.date()).days

            if days_diff > 1:
                return 0

            streak = 1

        else:
            days_diff = (activities[i - 1].date.date() - activity.date.date()).days

            if days_diff == 1:
                streak += 1
            elif days_diff > 1:
                break

    return streak


# -----------------------------
# Language progress
# -----------------------------
def get_language_progress(user_id: int, db: Session):

    languages = ["Python", "JavaScript", "Java", "C++", "SQL", "DSA"]
    result = []

    for lang in languages:

        total = db.query(Dailytask).filter(
            Dailytask.language == lang
        ).count()

        completed = db.query(ActivityLog).join(Dailytask).filter(
            ActivityLog.user_id == user_id,
            ActivityLog.completed == True,
            Dailytask.language == lang
        ).count()

        percent = int((completed / total) * 100) if total > 0 else 0

        result.append({
            "name": lang,
            "percentage": percent,
            "completed": completed,
            "total": total
        })

    return result