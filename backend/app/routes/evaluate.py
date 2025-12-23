"""
Evaluation Route
"""
from fastapi import APIRouter, HTTPException, Request
from app.models.requests import EvaluateRequest
from app.models.responses import EvaluateResponse
from app.SERVICES.multi_agent_service import multi_agent_service
from app.UTILS.logging import logger

router = APIRouter()

@router.post("", response_model=EvaluateResponse)
async def evaluate_teaching(request: EvaluateRequest, http_request: Request = None):  # type: ignore
    """Evaluate teaching quality using multi-agent system based on transcription and syllabus"""
    request_id = http_request.scope.get('request_id') if http_request else None
    
    logger.info("Multi-agent evaluation started", extra={"request_id": request_id})
    
    try:
        # Pass transcript and syllabus to multi_agent_service
        result = multi_agent_service.evaluate(request.transcribed_text, request.syllabus_text)
        
        # Format the response to match EvaluateResponse model
        # Assuming EvaluateResponse has scores, reasoning, improvements fields
        return result
    except Exception as e:
        logger.error(f"Multi-agent evaluation failed: {str(e)}", extra={"request_id": request_id})
        raise HTTPException(
            status_code=500,
            detail=f"Multi-agent evaluation failed: {str(e)}"
        )

