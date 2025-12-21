"""
AWS S3 Storage Service (Stub)
Local fallback implementation
"""
import os
from typing import Optional

class StorageService:
    """AWS S3 storage service stub with local fallback"""
    
    @staticmethod
    def upload_file(file_path: str, s3_key: str) -> bool:
        """Upload file to S3 (stub - uses local storage)"""
        # In production, upload to S3
        # For now, file is already saved locally
        return True
    
    @staticmethod
    def get_file_url(s3_key: str) -> Optional[str]:
        """Get file URL from S3 (stub)"""
        # In production, return S3 presigned URL
        return None

storage_service = StorageService()

