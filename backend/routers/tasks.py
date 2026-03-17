from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from backend.database import get_db
from backend.models import Dailytask, Question

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/today")
def get_today_tasks(
    language: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get daily tasks with optional filters"""

    query = db.query(Dailytask)

    if language:
        query = query.filter(Dailytask.language == language)

    if difficulty:
        query = query.filter(Dailytask.difficulty == difficulty)

    tasks = query.limit(20).all()

    # fallback if daily tasks empty
    if not tasks:
        query = db.query(Question)

        if language:
            query = query.filter(Question.subject == language)

        if difficulty:
            query = query.filter(Question.difficulty == difficulty)

        tasks = query.limit(20).all()

    return [
        {
            "id": getattr(task, "id", None) or getattr(task, "question_id", None),
            "title": getattr(task, "title", None) or getattr(task, "question_text", "Untitled"),
            "difficulty": getattr(task, "difficulty", "Medium"),
            "language": getattr(task, "language", None) or getattr(task, "subject", "General"),
            "percentage": getattr(task, "percentage", 70),
            "company": getattr(task, "company", None),
            "marks": getattr(task, "marks", 2),
            "description": getattr(task, "description", None) or getattr(task, "topic", "")
        }
        for task in tasks
    ]


@router.get("/languages")
def get_available_languages(db: Session = Depends(get_db)):
    """Get all unique languages available in tasks"""

    task_langs = db.query(Dailytask.language).distinct().all()
    question_langs = db.query(Question.subject).distinct().all()

    all_langs = set()

    for lang in task_langs + question_langs:
        if lang and lang[0]:
            all_langs.add(lang[0])

    return {
        "languages": sorted(list(all_langs)),
        "total": len(all_langs)
    }