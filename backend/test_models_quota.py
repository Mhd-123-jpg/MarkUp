import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

candidate_models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest"
]

for m in candidate_models:
    try:
        res = client.models.generate_content(
            model=m,
            contents="Say hello in 1 word"
        )
        print(f"MODEL SUCCESS: {m} -> {res.text.strip()}")
    except Exception as e:
        print(f"MODEL FAILED: {m} -> {e}")
