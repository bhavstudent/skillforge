import os
from groq import Groq
from google import genai
from google.genai import types
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

groq_client = None
if os.getenv("GROQ_API_KEY"):
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

gemini_client = None
if os.getenv("GEMINI_API_KEY"):
    gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

openrouter_client = None
if os.getenv("OPENROUTER_API_KEY"):
    openrouter_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
        )

def get_groq():
    if not groq_client:
        raise Exception("GROQ_API_KEY not set in environment variables.")
    return groq_client

def get_gemini():
    if not gemini_client:
        raise Exception("GEMINI_API_KEY not set in environment variables.")
    return gemini_client