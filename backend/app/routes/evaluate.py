"""
Evaluation Route
"""
from fastapi import APIRouter, HTTPException, Request
from app.models.requests import EvaluateRequest
from app.models.responses import EvaluateResponse
from app.services.evaluation_service import EvaluationService
from app.utils.logging import logger

router = APIRouter()

@router.post("", response_model=EvaluateResponse)
async def evaluate_teaching(request: EvaluateRequest, http_request: Request = None):  # type: ignore
    """Evaluate teaching quality based on transcription and syllabus"""
    request_id = getattr(http_request.state, 'request_id', None) if http_request else None
    
    logger.info("Evaluation started", request_id=request_id, metadata={
        "transcript_length": len(request.transcribed_text),
        "syllabus_length": len(request.syllabus_text),
    })
    
    try:
        result = EvaluationService.evaluate_teaching(request)
        
        logger.info("Evaluation completed", request_id=request_id, metadata={
            "overall_score": result.scores.overall_score,
            "engagement_score": result.scores.engagement_score,
            "coverage_score": result.scores.concept_coverage_score,
            "clarity_score": result.scores.clarity_score,
            "pedagogy_score": result.scores.pedagogy_score,
        })
        
        return result
    except Exception as e:
        logger.error(f"Evaluation failed: {str(e)}", request_id=request_id)
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )

