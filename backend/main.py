"""
Mentora API - Main Application
==============================
AWS-First Multimodal AI System for Teaching Quality Evaluation

This application demonstrates secure GenAI orchestration with:
- Amazon Bedrock integration (stub/ready)
- Amazon Transcribe integration (stub/ready)
- Amazon Rekognition integration (stub/ready)
- Amazon S3 storage (stub/ready)

ARCHITECTURE:
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│              GA4 Analytics + Professional UI                 │
└─────────────────────────────┬───────────────────────────────┘
                                │
┌─────────────────────────────▼───────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Auth     │  │   Upload    │  │    Evaluation       │  │
│  │  (Cognito)  │  │    (S3)     │  │    (Bedrock)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Transcribe  │  │ Rekognition │  │    Health Check     │  │
│  │   (ASR)     │  │   (Vision)  │  │    & Monitoring     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

SECURITY: All AI operations follow trust boundaries.
AUDITABILITY: All evaluations are logged and explainable.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import time
from dotenv import load_dotenv

from app.routes import upload, transcribe, evaluate, health, auth
from app.core.config import settings

load_dotenv()

app = FastAPI(
    title="Mentora API",
    description="""
    ## AWS-First Multimodal AI System for Teaching Quality Evaluation
    
    **Features:**
    - 🎬 Video Upload & Processing (AWS S3)
    - 🎙️ Speech-to-Text Transcription (AWS Transcribe)
    - 🤖 AI-Powered Evaluation (AWS Bedrock)
    - 📊 Explainable Scoring with Audit Trail
    - 🔐 JWT Authentication with RBAC
    
    **Demo Credentials:**
    - Email: `demo@mentora.ai` / Password: `demo123`
    - Or use `/auth/demo-token` for quick access
    
    **AWS Services (Stub-Ready):**
    - Amazon Bedrock (Claude 3 Sonnet)
    - Amazon Transcribe
    - Amazon Rekognition
    - Amazon S3
    - Amazon Cognito (migration path)
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header for performance monitoring."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


upload_dir = settings.UPLOAD_DIR
os.makedirs(upload_dir, exist_ok=True)

try:
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")
except Exception:
    pass

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/upload", tags=["Video Upload"])
app.include_router(transcribe.router, prefix="/transcribe", tags=["Transcription"])
app.include_router(evaluate.router, prefix="/evaluate", tags=["Evaluation"])
app.include_router(health.router, tags=["Health & Status"])


@app.get("/", tags=["Root"])
async def root():
    """API root endpoint with system information."""
    return {
        "name": "Mentora API",
        "version": "1.0.0",
        "description": "AWS-First Multimodal AI System for Teaching Quality Evaluation",
        "status": "operational",
        "aws_services": {
            "bedrock": {"status": "stub_ready", "model": settings.AWS_BEDROCK_MODEL_ID},
            "transcribe": {"status": "stub_ready", "language": settings.AWS_TRANSCRIBE_LANGUAGE_CODE},
            "rekognition": {"status": "stub_ready", "features": ["face_detection", "gesture_analysis"]},
            "s3": {"status": "stub_ready", "bucket": settings.AWS_S3_BUCKET_NAME}
        },
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
            "auth": "/auth",
            "demo_token": "/auth/demo-token"
        },
        "demo_credentials": {
            "email": "demo@mentora.ai",
            "password": "demo123",
            "note": "Use /auth/demo-token for quick access"
        }
    }


@app.get("/aws-status", tags=["AWS Integration"])
async def aws_integration_status():
    """
    Check AWS service integration status.
    
    Returns current status of all AWS service integrations.
    """
    return {
        "aws_region": settings.AWS_REGION,
        "services": {
            "bedrock": {
                "status": "stub",
                "ready_for_production": True,
                "model_id": settings.AWS_BEDROCK_MODEL_ID,
                "description": "Amazon Bedrock for GenAI evaluation reasoning"
            },
            "transcribe": {
                "status": "stub",
                "ready_for_production": True,
                "language_code": settings.AWS_TRANSCRIBE_LANGUAGE_CODE,
                "description": "Amazon Transcribe for speech-to-text"
            },
            "rekognition": {
                "status": "stub",
                "ready_for_production": True,
                "description": "Amazon Rekognition for visual engagement analysis"
            },
            "s3": {
                "status": "local_fallback",
                "ready_for_production": True,
                "bucket": settings.AWS_S3_BUCKET_NAME,
                "description": "Amazon S3 for video storage"
            },
            "cognito": {
                "status": "planned",
                "ready_for_production": False,
                "current_auth": "JWT with Supabase migration path",
                "description": "Amazon Cognito for production authentication"
            }
        },
        "security": {
            "trust_boundaries": "implemented",
            "prompt_injection_prevention": "active",
            "audit_logging": "enabled",
            "rbac": "implemented"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
