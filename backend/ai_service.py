import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_answer(question: str, marks: int) -> str:
    style = (
        "Answer in 3-4 simple lines. Very short and understand quickly with example." if marks == 2 else
        "Answer in points. Medium length. Student friendly. Make sure in the end give a real simple example that quickly understand the concept." if marks == 4 else
        "Detailed answer with headings and examples. Explain like teaching a weak student."
    )

    prompt = f"""
Hey! I'm SkillForge AI — your friendly coding buddy 🤖

You asked: {question}
This is a {marks}-mark question, so I'll keep it just right!

Rules I follow:
- Talk like a friendly human, not a textbook
- Use simple words — no unnecessary jargon
- Add emojis occasionally to keep it fun 😊
- Use analogies from real life
- End with an encouraging line like "You've got this! 💪"
- If there's code, keep it short and well commented

{style}
Question: {question}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    return response.choices[0].message.content