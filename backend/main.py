import os
import re
import shutil
import uuid
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv, set_key

from gemini_extractor import extract_booklet_data, BookletExtraction
from excel_manager import (
    ensure_master_workbook,
    append_booklet_record,
    get_all_records,
    delete_record_by_id,
    clear_all_records,
    EXCEL_FILE_PATH
)

load_dotenv()

ENV_FILE_PATH = os.path.join(os.path.dirname(__file__), ".env")

app = FastAPI(
    title="Mark-UP API",
    description="Backend service for Muthoot Institute of Technology & Science answer booklet mark scanning",
    version="1.0.0"
)

# GZip compression middleware for production hosting
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS setup for local and cloud hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory for serving temporary scanned images to frontend & downloadable APK
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

APK_FILE_PATH = os.path.join(UPLOADS_DIR, "Mark-UP-MITS.apk")

# Frontend static files dist path
FRONTEND_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

# Initialize master Excel file on startup
ensure_master_workbook()

class SaveRecordPayload(BaseModel):
    student_name: Optional[str] = ""
    roll_no: Optional[str] = ""
    semester: Optional[str] = ""
    branch: Optional[str] = ""
    exam_name: Optional[str] = "Internal Examination"
    course_code: Optional[str] = ""
    course_name: Optional[str] = ""
    date: Optional[str] = ""
    questions: Optional[Dict[str, Any]] = {}
    marks_secured: Optional[str] = ""
    max_marks: Optional[str] = ""

class SetApiKeyPayload(BaseModel):
    api_key: str

@app.get("/api/health")
def health_check():
    api_key = os.getenv("GEMINI_API_KEY")
    return {
        "status": "online",
        "gemini_api_configured": bool(api_key),
        "app_name": "Mark-UP Muthoot Backend",
        "apk_available": os.path.exists(APK_FILE_PATH)
    }

@app.get("/api/download-apk")
def download_apk():
    """Serves compiled standalone Android APK file for download."""
    if not os.path.exists(APK_FILE_PATH):
        raise HTTPException(status_code=404, detail="Android APK file not found.")
    return FileResponse(
        path=APK_FILE_PATH,
        filename="Mark-UP-MITS.apk",
        media_type="application/vnd.android.package-archive"
    )

@app.post("/api/set-key")
def set_api_key(payload: SetApiKeyPayload):
    """Allows updating backend GEMINI_API_KEY live from UI."""
    new_key = payload.api_key.strip()
    if not new_key:
        raise HTTPException(status_code=400, detail="API Key cannot be empty.")
    
    os.environ["GEMINI_API_KEY"] = new_key
    try:
        set_key(ENV_FILE_PATH, "GEMINI_API_KEY", new_key)
    except Exception as e:
        print(f"[SetKey] Warning writing .env: {e}")
        
    return {"success": True, "message": "API Key updated successfully!"}

@app.post("/api/scan")
async def scan_booklet(
    file: UploadFile = File(...),
    x_gemini_api_key: Optional[str] = Header(None)
):
    """Scans answer booklet photo using vision OCR with structured JSON output."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded must be an image (JPEG, PNG, WEBP, etc.)")

    try:
        contents = await file.read()
        
        # Save image locally so frontend can preview original image side-by-side
        file_ext = os.path.splitext(file.filename)[1] or ".jpg"
        unique_filename = f"{uuid.uuid4().hex}{file_ext}"
        saved_path = os.path.join(UPLOADS_DIR, unique_filename)
        
        with open(saved_path, "wb") as f:
            f.write(contents)

        image_url = f"/uploads/{unique_filename}"

        # Perform OCR Extraction
        extracted_data: BookletExtraction = extract_booklet_data(
            contents,
            mime_type=file.content_type,
            custom_api_key=x_gemini_api_key
        )

        return {
            "success": True,
            "image_url": image_url,
            "filename": file.filename,
            "data": extracted_data.model_dump()
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"[Scan Error] {e}")
        raise HTTPException(status_code=500, detail=f"Failed to scan answer booklet: {str(e)}")

@app.post("/api/save-record")
def save_record(payload: SaveRecordPayload):
    """Saves a verified booklet record to the master Excel workbook."""
    try:
        record_id = append_booklet_record(payload.model_dump())
        return {
            "success": True,
            "id": record_id,
            "message": f"Record #{record_id} saved successfully to master Excel workbook."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save record to Excel: {str(e)}")

@app.get("/api/records")
def list_records():
    """Lists all confirmed records currently stored in master Excel workbook."""
    records = get_all_records()
    return {
        "success": True,
        "count": len(records),
        "records": records
    }

@app.delete("/api/records")
def clear_records():
    """Clears all records from master Excel workbook, resetting table to empty."""
    clear_all_records()
    return {
        "success": True,
        "message": "Master class mark sheet cleared successfully."
    }

@app.delete("/api/records/{record_id}")
def delete_record(record_id: int):
    """Deletes a record from master Excel workbook by ID."""
    success = delete_record_by_id(record_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Record #{record_id} not found.")
    return {
        "success": True,
        "message": f"Record #{record_id} deleted."
    }

@app.get("/api/export-excel")
def export_excel(
    course_name: Optional[str] = None,
    batch: Optional[str] = None,
    exam_name: Optional[str] = None
):
    """Serves the master Excel file for download with formatted filename course_name_batch_exam_name.xlsx."""
    ensure_master_workbook()
    if not os.path.exists(EXCEL_FILE_PATH):
        raise HTTPException(status_code=404, detail="Master Excel workbook not found.")
    
    parts = []
    if course_name and course_name.strip():
        parts.append(re.sub(r'[/\\:*?"<>| ]+', '_', course_name.strip()))
    if batch and batch.strip():
        parts.append(re.sub(r'[/\\:*?"<>| ]+', '_', batch.strip()))
    if exam_name and exam_name.strip():
        parts.append(re.sub(r'[/\\:*?"<>| ]+', '_', exam_name.strip()))

    if parts:
        download_filename = f"{'_'.join(parts)}.xlsx"
    else:
        download_filename = "Muthoot_Internal_Exam_Marks.xlsx"
    
    return FileResponse(
        path=EXCEL_FILE_PATH,
        filename=download_filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

# Mount static frontend build files if dist directory exists
if os.path.exists(FRONTEND_DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404, detail="Not found")
        file_path = os.path.join(FRONTEND_DIST_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
