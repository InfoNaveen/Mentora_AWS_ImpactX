"""
Mentora Backend - FastAPI Application
AWS-First Multimodal AI for Teaching Quality Evaluation
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.routes import health, upload, transcribe, evaluate, auth
from app.middleware.logging import RequestLoggingMiddleware
from app.utils.logging import logger

load_dotenv()

app = FastAPI(
    title="Mentora API",
    description="AWS-First Multimodal AI System for Teaching Quality Evaluation",
    version="2.0.0"
)

# Request logging middleware (must be first)
# app.add_middleware(RequestLoggingMiddleware)  # Temporarily disabled for debugging

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(upload_dir, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Register routes
app.include_router(health.router, tags=["Health"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(transcribe.router, prefix="/transcribe", tags=["Transcribe"])
app.include_router(evaluate.router, prefix="/evaluate", tags=["Evaluate"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

