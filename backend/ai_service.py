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
    You are a helpful AI tutor. Answer the following question in a simple and easy way.
    Rules:
    1. Write the answer as a student in simple English.
    2. Use easy words and short sentences.
    3. Avoid complex technical terms.
    4. Do not use advanced explanations.
    5. Write the answer in exam style.
    6. If needed, use bullet points.
    7. Explain as if teaching a weak student.
    8. Keep the answer clear and friendly.

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