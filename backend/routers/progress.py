from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import ActivityLog, Dailytask, UserProgress

router = APIRouter(prefix = "/progress", tags = ["Progress"])

@router.get("/{user_id}")
def calculate_progress(user_id: str, db: Session = Depends(get_db)):
    languages = ["Java", "Python", "DSA", "C", "C++", "JavaScript"]
    result = []

    for lang in languages:
        total = db.query(Dailytask).filter(Dailytask.language == lang).count()
        completed = (
            db.query(ActivityLog)
            .join(Dailytask)
            .filter(
                ActivityLog.user_id == user_id,
                ActivityLog.completed == True,
                Dailytask.language == lang
            )

            .count()
        )

        percent = int((completed / total) * 100) if total else 0
        result.append({"language": lang, "percentage": percent})

    return result