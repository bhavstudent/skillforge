from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import ActivityLog
from datetime import date

router = APIRouter(prefix = "/activity", tags = ["Activity"])

@router.post("/log")
def log_activity(data: dict, db: Session = Depends(get_db)):
    activity = ActivityLog(
        user_id = data["user_id"],
        task_id = data["task_id"],
        date = date.today(),
        completed = data["completed"]
    )

    db.add(activity)
    db.commit()
    return {"message": "Activity logged successfully"}