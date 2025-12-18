import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.responses import UploadResponse
from app.utils.file_utils import generate_unique_filename, get_file_size, is_video_file

router = APIRouter()

@router.post("/video", response_model=UploadResponse)
async def upload_video(file: UploadFile = File(...)):
    """Upload a lecture video file"""
    
    print(f"Received upload request for file: {file.filename}")
    
    # Validate file type
    if not is_video_file(file.filename):
        print(f"Invalid file type: {file.filename}")
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Please upload a video file."
        )
    
    # Check file size (100MB limit) - we'll check after reading
    max_size = int(os.getenv("MAX_FILE_SIZE", 100000000))  # 100MB
    
    try:
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename)
        upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Read file content
        content = await file.read()
        
        # Check file size after reading
        if len(content) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {max_size // 1000000}MB."
            )
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        file_size = len(content)
        
        print(f"Upload successful: {unique_filename}, size: {file_size}")
        return UploadResponse(
            message="Video uploaded successfully",
            filename=unique_filename,
            file_path=file_path,
            file_size=file_size
        )
    
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")