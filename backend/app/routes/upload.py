"""
Video Upload Route
"""
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.responses import UploadResponse
from app.utils.file_utils import generate_unique_filename, is_video_file

router = APIRouter()

@router.post("/video", response_model=UploadResponse)
async def upload_video(file: UploadFile = File(...)):
    """Upload a lecture video file"""
    
    if not is_video_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a video file."
        )
    
    max_size = int(os.getenv("MAX_FILE_SIZE", "100000000"))  # 100MB
    
    try:
        unique_filename = generate_unique_filename(file.filename)
        upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
        file_path = os.path.join(upload_dir, unique_filename)
        
        content = await file.read()
        
        if len(content) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {max_size // 1000000}MB."
            )
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        return UploadResponse(
            message="Video uploaded successfully",
            filename=unique_filename,
            file_path=file_path,
            file_size=len(content)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

