"""
Evaluation Route
"""
from fastapi import APIRouter, HTTPException
from app.models.requests import EvaluateRequest
from app.models.responses import EvaluateResponse
from app.services.evaluation_service import EvaluationService

router = APIRouter()

@router.post("", response_model=EvaluateResponse)
async def evaluate_teaching(request: EvaluateRequest):
    """Evaluate teaching quality based on transcription and syllabus"""
    try:
        result = EvaluationService.evaluate_teaching(request)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )

