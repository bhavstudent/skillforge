# backend/routers/ai.py
# ✅ AI Explanation + Career Analysis + PDF Generation

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq
from pydantic import BaseModel
from typing import Optional
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import json
import os

from backend.schemas import AIQuestionRequest
from backend.database import get_db
from backend.models import Question
from backend.pdf_service import generate_pdf

# Load environment variables
load_dotenv()

router = APIRouter(prefix='/ai', tags=["AI"])

# ✅ Initialize Groq client ONCE at module level
groq_client = None
if os.getenv("GROQ_API_KEY"):
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ============ Request Models ============
class ExplainQuestionRequest(BaseModel):
    question_id: int
    marks: int = 4
    language: str = "English"

class CareerAnalysisRequest(BaseModel):
    languages: list
    total_solved: int
    streak: int
    topics: list = []

# ============ AI Explanation Endpoint ============
@router.post("/explain-question")
async def explain_question(
    question_id: int,
    marks: int = 4,
    language: str = "English",
    db: Session = Depends(get_db)
):
    """
    Generate AI explanation with diagram suggestions and simple language
    
    Returns structured JSON with:
    - concept_overview
    - visual_diagram (ASCII/text-based)
    - step_by_step
    - code_example
    - key_points
    - common_mistakes
    - practice_tip
    - summary
    """
    
    # ✅ Check if Groq is configured
    if not groq_client:
        raise HTTPException(
            status_code=503, 
            detail="AI service not configured. Add GROQ_API_KEY to .env"
        )
    
    # ✅ Fetch question from database
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # ✅ Build enhanced prompt for simple, visual explanations
    prompt = f"""You are an expert computer science tutor specializing in making complex topics SIMPLE for students.

📋 QUESTION DETAILS:
- Text: {question.question_text}
- Subject: {question.subject}
- Topic: {question.topic}
- University: {question.university}
- Year: {question.year}
- Difficulty: {question.difficulty}
- Expected Marks: {marks}
- Explanation Language: {language}

🎯 YOUR TASK:
Generate a BEGINNER-FRIENDLY explanation that anyone can understand. Use simple words, real-life analogies, and visual diagrams.

📝 RESPONSE FORMAT (MUST be valid JSON with this exact structure):
{{
    "concept_overview": "2-3 simple sentences explaining the core idea in plain {language}",
    "visual_diagram": "ASCII art or text-based diagram to visualize the concept (use characters like →, ↓, ┌─┐, etc.)",
    "step_by_step": [
        "Step 1: First thing to do...",
        "Step 2: Second thing...",
        "Step 3: Third thing..."
    ],
    "code_example": "```python\\n# Commented code example\\ndef example():\\n    pass\\n```",
    "key_points": [
        "Important point 1",
        "Important point 2",
        "Important point 3"
    ],
    "common_mistakes": [
        "Mistake 1 and how to avoid it",
        "Mistake 2 and how to avoid it"
    ],
    "practice_tip": "One actionable tip to practice this concept",
    "summary": "One-line recap in simple words"
}}

💡 GUIDELINES:
- Use SIMPLE words (avoid jargon where possible)
- Add analogies from real life (e.g., "Think of a variable like a box...")
- Include a text-based diagram/visualization using ASCII characters
- Keep code examples short (5-10 lines) and well-commented
- Explain WHY, not just HOW
- Tone: Friendly, encouraging, like a helpful senior student
- For {marks} marks: Keep it concise but complete

Respond with VALID JSON ONLY (no markdown code blocks around it)."""

    try:
        # ✅ Call Groq API with Llama 3.1
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Fast, capable, free tier
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,  # Lower = more focused, less creative
            max_tokens=2000,  # Enough for detailed explanation
            top_p=0.95
        )
        
        # ✅ Parse JSON response
        explanation_text = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if explanation_text.startswith("```json"):
            explanation_text = explanation_text.replace("```json", "").replace("```", "").strip()
        elif explanation_text.startswith("```"):
            explanation_text = explanation_text.replace("```", "").strip()
        
        # Parse JSON
        try:
            explanation_data = json.loads(explanation_text)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            explanation_data = {
                "concept_overview": explanation_text,
                "visual_diagram": "",
                "step_by_step": [],
                "code_example": "",
                "key_points": [],
                "common_mistakes": [],
                "practice_tip": "",
                "summary": ""
            }
        
        return {
            "question_id": question_id,
            "explanation": explanation_data,
            "model": "llama-3.1-8b-instant",
            "marks": marks,
            "language": language
        }
        
    except Exception as e:
        print(f"Groq API error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate explanation: {str(e)}"
        )

# ============ AI Ask Endpoint (Existing) ============
@router.post("/ask")
async def get_answer(data: AIQuestionRequest):
    """
    Simple Q&A endpoint for quick questions
    """
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    try:
        prompt = f"""You are an expert academic tutor. Answer this question clearly for a {data.marks}-mark exam answer.

Question: {data.question}

Provide a structured answer with:
1. Concept overview
2. Key points
3. Example if applicable

Keep it concise for {data.marks} marks."""

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000
        )
        
        return {
            "question": data.question,
            "marks": data.marks,
            "answer": response.choices[0].message.content
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

# ============ PDF Generation Endpoint (Existing) ============
@router.post("/ask/pdf")
async def ask_ai_pdf(data: AIQuestionRequest):
    """
    Generate answer and return as PDF
    """
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    try:
        # Generate answer
        prompt = f"""Answer this question for a {data.marks}-mark exam: {data.question}"""
        
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000
        )
        
        answer = response.choices[0].message.content
        
        # Generate PDF
        pdf_file = generate_pdf(data.question, answer, data.marks)
        
        return FileResponse(
            pdf_file,
            filename=f"answer_{data.marks}marks.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

# ============ Career Analysis Endpoint (Enhanced) ============
@router.post("/career-analysis")
async def analyze_career_path(data: dict):
    """
    Analyzes user's learning pattern and suggests career paths
    
    data example:
    {
        "languages": [
            {"name": "Python", "percentage": 75, "tasks_completed": 38},
            {"name": "SQL", "percentage": 60, "tasks_completed": 17},
            {"name": "JavaScript", "percentage": 40, "tasks_completed": 10}
        ],
        "total_solved": 186,
        "streak": 7,
        "topics": ["Arrays", "Strings", "Data Structures", "Algorithms"]
    }
    """
    
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    # ✅ Build AI prompt with user's actual data
    languages_text = ", ".join([
        f"{lang.get('name', 'Unknown')} ({lang.get('percentage', 0)}%)" 
        for lang in data.get("languages", [])
    ])
    
    topics_text = ", ".join(data.get("topics", []))
    
    prompt = f"""
You are an AI career counselor for tech students. Analyze this student's learning pattern and provide personalized career guidance.

STUDENT PROFILE:
- Languages & Proficiency: {languages_text}
- Total Problems Solved: {data.get('total_solved', 0)}
- Current Streak: {data.get('streak', 0)} days
- Topics Studied: {topics_text}

ANALYSIS REQUIREMENTS:
1. Identify their strongest skills based on percentages and completion
2. Match their learning pattern to suitable career paths
3. Be specific - don't just say "Developer", say "Backend Python Developer" or "Data Analyst"
4. Consider emerging tech trends (AI/ML, Cloud, DevOps, etc.)
5. Be encouraging but realistic

Provide JSON response with this exact structure:
{{
    "primary_career": "Best career match (be specific)",
    "match_percentage": 85,
    "alternative_careers": ["2-3 other suitable careers"],
    "why_this_match": "Explain WHY their skills match this career (2-3 sentences)",
    "strengths": ["3-5 skills they're good at"],
    "skill_gaps": [
        {{
            "skill": "Skill name",
            "current_level": 40,
            "required_level": 70,
            "priority": "high/medium/low",
            "action": "Specific action to improve"
        }}
    ],
    "recommendations": [
        {{
            "title": "What to learn/do",
            "description": "Why it's important",
            "priority": "high/medium/low",
            "estimated_time": "2-4 weeks"
        }}
    ],
    "roadmap": [
        {{
            "step": 1,
            "title": "Milestone",
            "completed": true,
            "description": "What this means"
        }}
    ],
    "industry_benchmarks": {{
        "Python": 80,
        "DSA": 75,
        "Projects": 3
    }},
    "motivation_message": "Encouraging 1-2 line message"
}}

Be specific, actionable, and personalized to THEIR learning pattern. Respond with VALID JSON only."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000
        )
        
        # Parse JSON from AI response
        insight_text = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if insight_text.startswith("```json"):
            insight_text = insight_text.replace("```json", "").replace("```", "").strip()
        elif insight_text.startswith("```"):
            insight_text = insight_text.replace("```", "").strip()
        
        insight = json.loads(insight_text)
        
        return insight
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        # Fallback if JSON parsing fails
        return {
            "primary_career": "Software Developer",
            "match_percentage": 65,
            "alternative_careers": ["Web Developer", "Data Analyst"],
            "why_this_match": "Based on your current learning pattern and problem-solving skills.",
            "strengths": ["Problem Solving", "Consistent Practice", "Quick Learner"],
            "skill_gaps": [
                {
                    "skill": "System Design",
                    "current_level": 40,
                    "required_level": 70,
                    "priority": "medium",
                    "action": "Study microservices architecture"
                }
            ],
            "recommendations": [
                {
                    "title": "Build a Portfolio Project",
                    "description": "Showcase your skills to employers",
                    "priority": "high",
                    "estimated_time": "3-4 weeks"
                }
            ],
            "roadmap": [
                {
                    "step": 1,
                    "title": "Master Core Language",
                    "completed": True,
                    "description": "You're doing great!"
                },
                {
                    "step": 2,
                    "title": "Build Projects",
                    "completed": False,
                    "description": "Apply your knowledge"
                }
            ],
            "industry_benchmarks": {
                "Python": 80,
                "DSA": 75,
                "Projects": 3
            },
            "motivation_message": "You're on the right track! Keep building and learning. 🚀"
        }
        
    except Exception as e:
        print(f"Career analysis error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Career analysis failed: {str(e)}"
        )

# ============ Health Check ============
@router.get("/models")
async def list_ai_models():
    """List available AI models (for debugging)"""
    return {
        "available_models": [
            "llama-3.1-8b-instant",
            "llama-3.1-70b-versatile",
            "mixtral-8x7b-32768"
        ],
        "default": "llama-3.1-8b-instant",
        "features": [
            "JSON output support",
            "Diagram generation",
            "Multi-language explanations"
        ],
        "status": "active" if groq_client else "not_configured"
    }