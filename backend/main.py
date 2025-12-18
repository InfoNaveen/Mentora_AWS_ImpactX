from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.routes import upload, transcribe, evaluate, health

load_dotenv()

app = FastAPI(
    title="Mentora API",
    description="Multimodal AI System for Teaching Quality Evaluation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(upload_dir, exist_ok=True)

# Mount static files for uploaded content
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include routers
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(transcribe.router, prefix="/transcribe", tags=["transcribe"])
app.include_router(evaluate.router, prefix="/evaluate", tags=["evaluate"])
app.include_router(health.router, tags=["health"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)