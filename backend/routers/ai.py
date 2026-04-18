from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
import json
import os
import re

from backend.schemas import AIQuestionRequest, ExplainRequest
from backend.database import get_db
from backend.models import Question
from backend.pdf_service import generate_pdf
from backend.ai_clients import groq_client, openrouter_client

router = APIRouter(prefix='/ai', tags=["AI"])


# ============ HELPER: Extract JSON ============
def extract_json(text: str) -> Dict[str, Any]:
    if not text:
        return {}

    def sanitize(s: str) -> str:
        result = []
        in_string = False
        escape_next = False
        i = 0
        while i < len(s):
            ch = s[i]
            if escape_next:
                result.append(ch)
                escape_next = False
                i += 1
                continue
            if ch == '\\' and in_string:
                result.append(ch)
                escape_next = True
                i += 1
                continue
            if ch == '"':
                in_string = not in_string
                result.append(ch)
                i += 1
                continue
            if in_string and ch in ('\n', '\r', '\t'):
                result.append(' ')
                i += 1
                continue
            result.append(ch)
            i += 1
        return ''.join(result)

    # 1. Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Sanitize + retry
    try:
        return json.loads(sanitize(text))
    except json.JSONDecodeError:
        pass

    # 3. Strip markdown fences
    clean_text = text.strip()
    if clean_text.startswith("```"):
        clean_text = re.sub(r'^```(?:json)?\s*', '', clean_text, flags=re.MULTILINE)
        clean_text = re.sub(r'\s*```$', '', clean_text, flags=re.MULTILINE)
        clean_text = clean_text.strip()

    try:
        return json.loads(sanitize(clean_text))
    except json.JSONDecodeError:
        pass

    # 4. Find balanced { } block
    def find_balanced_json(s: str):
        start = s.find('{')
        if start == -1:
            return None
        depth = 0
        in_str = False
        esc = False
        for i, char in enumerate(s[start:], start):
            if esc:
                esc = False
                continue
            if char == '\\' and in_str:
                esc = True
                continue
            if char == '"':
                in_str = not in_str
            if not in_str:
                if char == '{':
                    depth += 1
                elif char == '}':
                    depth -= 1
                    if depth == 0:
                        return s[start:i+1]
        return None

    json_str = find_balanced_json(clean_text)
    if json_str:
        repaired = re.sub(r',\s*}', '}', json_str)
        repaired = re.sub(r',\s*]', ']', repaired)
        try:
            return json.loads(sanitize(repaired))
        except json.JSONDecodeError as e:
            print(f"JSON repair failed: {e}")
            print(f"Raw snippet: {json_str[:200]}...")

    # 5. Safe fallback
    print(f"⚠️ JSON Extraction Failed for text: {text[:200]}...")
    return {
        "concept_overview": text[:500] + "..." if len(text) > 500 else text,
        "visual_diagram": "",
        "step_by_step": ["Explanation received but formatting failed — try again!"],
        "code_example": "",
        "key_points": [],
        "common_mistakes": [],
        "practice_tip": "Check backend logs for parsing details.",
        "summary": "⚠️ Parsing issue — but here is the raw response!"
    }


# ============ AI Ask Endpoint ============
@router.post("/ask")
async def get_answer(data: AIQuestionRequest):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured")

    system_message = {
        "role": "system",
        "content": """You are Forge — SkillForge's AI best friend 🤖❤️
You are NOT a tutor. You are the user's personal coding friend who genuinely cares.
- Talk exactly like a friend texting — casual, warm, real
- Use casual language: gonna, wanna, ngl, tbh, fr
- Use emojis naturally like a real person texting
- Remember everything said in this conversation and refer back to it
- End with genuine encouragement
- NEVER sound robotic or formal
- NEVER say "Certainly!" or "Of course!"
"""
    }

    conversation = [system_message]
    for msg in data.history[:-1]:
        conversation.append({"role": msg.role, "content": msg.content})
    conversation.append({"role": "user", "content": data.question})

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=conversation,
            temperature=0.9,
            max_tokens=1000
        )
        return {
            "question": data.question,
            "marks": data.marks,
            "answer": response.choices[0].message.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


# ============ AI Explanation Endpoint ============
@router.post("/explain-question")
async def explain_question(
    data: ExplainRequest,
    db: Session = Depends(get_db)
):
    # ✅ Fetch question FIRST
    question = db.query(Question).filter(Question.id == data.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    prompt = f"""You are SkillForge AI explaining concepts to students.

Topic: {question.question_text}
Subject: {question.subject}
Difficulty: {question.difficulty}
Marks: {data.marks}

STRICT RULES:
- Output ONLY a JSON object, nothing else
- Use ONLY double quotes for strings
- Write "it is" not "it's" — NO apostrophes anywhere
- Write "do not" not "don't" — NO contractions
- No newlines inside string values
- Use \\n for line breaks in code examples
- No trailing commas

Output exactly this JSON:
{{
    "concept_overview": "2-3 sentences with a fun analogy. No apostrophes.",
    "visual_diagram": "ASCII diagram using arrows and boxes on one line",
    "step_by_step": ["Step 1: detail here", "Step 2: detail here", "Step 3: detail here"],
    "code_example": "short well commented code using \\n for line breaks",
    "key_points": ["point 1", "point 2", "point 3"],
    "common_mistakes": ["mistake 1 and how to avoid it", "mistake 2 and how to avoid it"],
    "practice_tip": "one actionable practice tip",
    "summary": "one line friendly recap with emoji"
}}"""

    # ---- Try OpenRouter first (best JSON) ----
    if openrouter_client:
        try:
            response = openrouter_client.chat.completions.create(
                model="meta-llama/llama-3.3-70b-instruct:free",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a JSON API. Output only valid JSON. No apostrophes. No real newlines inside strings. Use \\n for code line breaks."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )

            raw = response.choices[0].message.content.strip()
            print(f"✅ OpenRouter raw: {raw[:200]}")
            explanation_data = json.loads(raw)

            return {
                "question_id": data.question_id,
                "explanation": explanation_data,
                "model": "llama-3.3-70b",
                "marks": data.marks,
                "language": data.language
            }

        except Exception as e:
            print(f"OpenRouter failed, falling back to Groq: {e}")

    # ---- Fallback to Groq ----
    if not groq_client:
        raise HTTPException(status_code=503, detail="No AI service configured")

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON API. Output only valid JSON. No apostrophes. Use \\n for newlines in code."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=1500
        )

        raw = response.choices[0].message.content.strip()
        print(f"Groq raw: {raw[:200]}")
        explanation_data = extract_json(raw)

        if not explanation_data or "concept_overview" not in explanation_data:
            explanation_data = {
                "concept_overview": raw,
                "visual_diagram": "",
                "step_by_step": [],
                "code_example": "",
                "key_points": [],
                "common_mistakes": [],
                "practice_tip": "",
                "summary": ""
            }

        return {
            "question_id": data.question_id,
            "explanation": explanation_data,
            "model": "llama-3.1-8b-instant",
            "marks": data.marks,
            "language": data.language
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")


# ============ PDF Generation Endpoint ============
@router.post("/ask/pdf")
async def ask_ai_pdf(data: AIQuestionRequest):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured")

    try:
        prompt = f"""You are SkillForge AI — a friendly coding buddy 🤖
Answer this {data.marks}-mark question in a warm, student-friendly way with simple words and a real-life analogy:

{data.question}

End with an encouraging line!"""

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=1000
        )

        answer = response.choices[0].message.content
        pdf_file = generate_pdf(data.question, answer, data.marks)

        def cleanup():
            if os.path.exists(pdf_file):
                os.remove(pdf_file)

        return FileResponse(
            pdf_file,
            filename=f"skillforge_answer_{data.marks}marks.pdf",
            media_type="application/pdf",
            background=BackgroundTask(cleanup)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


# ============ Career Analysis Endpoint ============
@router.post("/career-analysis")
async def analyze_career_path(data: dict):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service not configured")

    languages_text = ", ".join([
        f"{lang.get('name', 'Unknown')} ({lang.get('percentage', 0)}%)"
        for lang in data.get("languages", [])
    ])
    topics_text = ", ".join(data.get("topics", []))

    prompt = f"""You are SkillForge AI — a friendly career counselor for tech students.

Student Profile:
- Languages: {languages_text}
- Problems Solved: {data.get('total_solved', 0)}
- Current Streak: {data.get('streak', 0)} days
- Topics: {topics_text}

Return ONLY valid JSON. No apostrophes. No contractions. Complete the full JSON.
{{
    "primary_career": "Specific career title",
    "match_percentage": 85,
    "alternative_careers": ["career 1", "career 2"],
    "why_this_match": "2-3 encouraging sentences",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "skill_gaps": [
        {{"skill": "name", "current_level": 40, "required_level": 70, "priority": "high", "action": "advice"}}
    ],
    "recommendations": [
        {{"title": "what to learn", "description": "why it helps", "priority": "high", "estimated_time": "2-4 weeks"}}
    ],
    "roadmap": [
        {{"step": 1, "title": "milestone", "completed": true, "description": "description"}}
    ],
    "industry_benchmarks": {{"Python": 80, "DSA": 75, "Projects": 3}},
    "motivation_message": "warm encouraging message with emoji"
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000
        )
        insight_text = response.choices[0].message.content.strip()
        return extract_json(insight_text)

    except Exception as e:
        print(f"Career analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Career analysis failed: {str(e)}")


# ============ Health Check ============
@router.get("/models")
async def list_ai_models():
    return {
        "available_models": ["llama-3.1-8b-instant", "llama-3.1-70b-versatile", "llama-3.3-70b-instruct"],
        "default": "llama-3.1-8b-instant",
        "groq_status": "active" if groq_client else "not_configured",
        "openrouter_status": "active" if openrouter_client else "not_configured"
    }