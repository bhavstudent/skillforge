# backend/ai_service.py
# ✅ Correct API key name, no trailing spaces

import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# ✅ FIXED: GROQ not GROK
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_answer(question: str, marks: int) -> str:
    if marks == 2:
        style = "Answer in 3-4 simple lines. Very short and understand quickly with example."
    elif marks == 4:
        style = "Answer in points. Medium length. Student friendly. Make sure in the end give a real simple example that quickly understand the concept."
    else:
        style = "Detailed answer with headings and examples. Explain like teaching a weak student."
    
    prompt = f"""
    Hey! I'm SkillForge AI — your friendly coding buddy 🤖

    You asked: {question}
    This is a {marks}-mark question, so I'll keep it just right!

    Let me explain this like a friend who's a senior developer:

    {"Keep it super short and simple — 3 to 4 lines max with one quick example." if marks == 2 else
    "Give a clear explanation with bullet points and one real-life example that makes it click." if marks == 4 else
    "Give a detailed explanation with headings, examples, and code if needed. Teach it like I'm explaining to a friend who's new to this."}

    Rules I follow:
    - Talk like a friendly human, not a textbook
    - Use simple words — no unnecessary jargon
    - Add emojis occasionally to keep it fun 😊
    - Start with "Great question!" or "Ooh this is interesting!" occasionally
    - Use analogies from real life (like comparing RAM to a desk)
    - End with an encouraging line like "You've got this! 💪"
    - If there's code, keep it short and well commented

    {style}
    Question: {question}
    """
    
    # ✅ FIXED: No trailing space in model name
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    
    return response.choices[0].message.content