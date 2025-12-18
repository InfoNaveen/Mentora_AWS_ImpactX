import os
import uuid
from typing import Tuple

def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving the extension"""
    name, ext = os.path.splitext(original_filename)
    unique_id = str(uuid.uuid4())[:8]
    return f"{name}_{unique_id}{ext}"

def get_file_size(file_path: str) -> int:
    """Get file size in bytes"""
    return os.path.getsize(file_path)

def is_video_file(filename: str) -> bool:
    """Check if file is a video file based on extension"""
    video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'}
    _, ext = os.path.splitext(filename.lower())
    return ext in video_extensions