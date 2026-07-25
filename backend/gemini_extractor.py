import os
import io
import json
import hashlib
import time
import concurrent.futures
from typing import Dict, Optional, List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

class QuestionSubMarks(BaseModel):
    a: Optional[str] = None
    b: Optional[str] = None
    c: Optional[str] = None

class BookletExtraction(BaseModel):
    student_name: Optional[str] = Field(default="")
    roll_no: Optional[str] = Field(default="")
    semester: Optional[str] = Field(default="")
    branch: Optional[str] = Field(default="")
    exam_name: Optional[str] = Field(default="Internal Examination")
    course_code: Optional[str] = Field(default="")
    course_name: Optional[str] = Field(default="")
    date: Optional[str] = Field(default="")
    questions: Dict[str, QuestionSubMarks] = Field(
        default_factory=lambda: {str(i): QuestionSubMarks() for i in range(1, 11)}
    )
    marks_secured: Optional[str] = Field(default="")
    max_marks: Optional[str] = Field(default="")
    confidence_flags: List[str] = Field(default_factory=list)
    extraction_source: Optional[str] = Field(default="gemini_api")

# Disk Cache directory to avoid consuming quota on duplicate images
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

PROMPT_TEXT = """
You are an expert OCR vision AI reading handwritten cover pages of answer booklets titled "INTERNAL EXAMINATION" for Muthoot Institute of Technology & Science.

Extract all handwritten and printed details into the following EXACT JSON format:

{
  "student_name": "handwritten student name (blue/black ink)",
  "roll_no": "handwritten roll number",
  "semester": "handwritten semester",
  "branch": "handwritten branch/department",
  "exam_name": "handwritten exam name (e.g. I.E., First Internal Examination)",
  "course_code": "handwritten course code (e.g. AIT 252, AIT 352)",
  "course_name": "handwritten course name (e.g. ANN, Artificial Neural N)",
  "date": "handwritten date (e.g. 29/1/96)",
  "questions": {
    "1": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "2": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "3": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "4": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "5": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "6": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "7": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "8": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "9": {"a": "mark or null", "b": "mark or null", "c": "mark or null"},
    "10": {"a": "mark or null", "b": "mark or null", "c": "mark or null"}
  },
  "marks_secured": "boxed total marks obtained (red ink, e.g. 44, 32+1, 41)",
  "max_marks": "boxed maximum marks (e.g. 50)",
  "confidence_flags": ["list of field names where confidence is <90% or sum mismatch occurred"]
}

STRICT OCR RULES:
1. Read handwritten red ink marks in the grid and boxed fields carefully.
2. Distinguish 3 vs 8, 1 vs 7, 0 vs 6, 4 vs 9.
3. Visually empty/blank grid cells MUST be returned as null (never guess 0 or fake a value).
4. Calculate sum of sub-questions and check against marks_secured. If they do not match, add "marks_secured" to confidence_flags.
5. Return ONLY valid JSON.
"""

def extract_booklet_data(image_bytes: bytes, mime_type: str = "image/jpeg", custom_api_key: Optional[str] = None) -> BookletExtraction:
    # 1. Check Image Cache first
    img_hash = hashlib.sha256(image_bytes).hexdigest()
    cache_file = os.path.join(CACHE_DIR, f"{img_hash}.json")
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r") as f:
                cached_data = json.load(f)
                data = BookletExtraction.model_validate(cached_data)
                data.extraction_source = "cache"
                return data
        except Exception as e:
            print(f"[Cache] Read error: {e}")

    # 2. Determine API Key (custom or env)
    api_key = custom_api_key or os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[Gemini Extractor] No API Key set. Falling back to local offline extraction...")
        return _offline_fallback_extractor(image_bytes)

    client = genai.Client(api_key=api_key)
    
    models_to_try = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash"
    ]
    
    MODEL_TIMEOUT_SECONDS = 15  # Max time to wait per model before skipping
    
    last_error = None
    for model_name in models_to_try:
        try:
            def _call_model(mn=model_name):
                return client.models.generate_content(
                    model=mn,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                        PROMPT_TEXT
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1
                    )
                )
            
            # Run with timeout to avoid hanging on quota-exhausted models
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(_call_model)
                response = future.result(timeout=MODEL_TIMEOUT_SECONDS)
            
            if response.text:
                json_str = _clean_json_str(response.text)
                raw_dict = json.loads(json_str)
                data = BookletExtraction.model_validate(raw_dict)
                data.extraction_source = f"gemini_{model_name}"
                _validate_and_flag_sums(data)
                
                # Save result to cache
                try:
                    with open(cache_file, "w") as f:
                        json.dump(data.model_dump(), f, indent=2)
                except Exception as ce:
                    print(f"[Cache] Write error: {ce}")
                    
                return data
        except concurrent.futures.TimeoutError:
            print(f"[Gemini Extractor] Model {model_name} timed out after {MODEL_TIMEOUT_SECONDS}s, skipping...")
            last_error = Exception(f"{model_name} timed out")
            continue
        except Exception as e:
            last_error = e
            err_msg = str(e)
            print(f"[Gemini Extractor] Model {model_name} failed: {e}")
            # If 429 quota limit, skip instantly to next candidate model with separate quota
            if "RESOURCE_EXHAUSTED" in err_msg or "429" in err_msg or "404" in err_msg:
                continue

    # 3. If ALL Gemini models hit quota limits, use Offline Fallback so the teacher is NEVER blocked!
    print(f"[Gemini Extractor] All online API quotas exhausted ({last_error}). Triggering Offline Fallback Extractor...")
    fallback_data = _offline_fallback_extractor(image_bytes)
    fallback_data.confidence_flags.append("quota_exhausted_fallback")
    return fallback_data

def _clean_json_str(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def _validate_and_flag_sums(data: BookletExtraction):
    """Calculates total sum of sub-questions and flags mismatch if any."""
    total_sub_marks = 0.0
    has_sub_marks = False
    
    if data.questions:
        for q_num, sub_q in data.questions.items():
            for sub_key in ["a", "b", "c"]:
                val_str = getattr(sub_q, sub_key, None)
                if val_str is not None and str(val_str).strip() != "":
                    try:
                        total_sub_marks += float(str(val_str).strip())
                        has_sub_marks = True
                    except ValueError:
                        pass
    
    if data.marks_secured and data.marks_secured.strip() != "":
        try:
            secured_val = float(data.marks_secured.strip())
            if has_sub_marks and abs(total_sub_marks - secured_val) > 0.01:
                if "marks_secured" not in data.confidence_flags:
                    data.confidence_flags.append("marks_secured")
                if "sum_mismatch" not in data.confidence_flags:
                    data.confidence_flags.append("sum_mismatch")
        except ValueError:
            if "marks_secured" not in data.confidence_flags:
                data.confidence_flags.append("marks_secured")

def _offline_fallback_extractor(image_bytes: bytes) -> BookletExtraction:
    """
    Offline fallback extractor that generates a structured draft template
    so teachers can manually verify/enter fields on the side-by-side review UI
    even when internet or API key quota is completely exhausted.
    """
    questions = {str(i): QuestionSubMarks() for i in range(1, 11)}
    
    # Flag fields so teacher is prompted to verify them on UI
    flags = [
        "student_name", "roll_no", "semester", "branch",
        "course_code", "course_name", "date", "marks_secured",
        "offline_mode"
    ]
    
    return BookletExtraction(
        student_name="",
        roll_no="",
        semester="S6",
        branch="CSE",
        exam_name="Internal Examination",
        course_code="",
        course_name="",
        date="",
        questions=questions,
        marks_secured="",
        max_marks="50",
        confidence_flags=flags,
        extraction_source="offline_fallback"
    )
