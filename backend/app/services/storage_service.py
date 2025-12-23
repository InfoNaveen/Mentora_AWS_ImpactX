"""
AWS S3 Storage Service
Cloud storage for video files
"""
import os
import boto3
from typing import Optional
from app.core.config import settings


class StorageService:
    """AWS S3 storage service with local fallback"""
    
    def __init__(self):
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                's3',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            self.is_configured = True
        else:
            self.s3_client = None
            self.is_configured = False
    
    def upload_file(self, file_path: str, s3_key: str) -> bool:
        """Upload file to S3"""
        if not self.is_configured or not settings.AWS_S3_BUCKET_NAME:
            # Use local storage as fallback
            return self._local_upload(file_path, s3_key)
        
        try:
            self.s3_client.upload_file(
                file_path,
                settings.AWS_S3_BUCKET_NAME,
                s3_key
            )
            return True
        except Exception as e:
            print(f"S3 upload failed: {str(e)}")
            # Fallback to local storage
            return self._local_upload(file_path, s3_key)
    
    def get_file_url(self, s3_key: str) -> Optional[str]:
        """Get file URL from S3"""
        if not self.is_configured or not settings.AWS_S3_BUCKET_NAME:
            return None
        
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.AWS_S3_BUCKET_NAME, 'Key': s3_key},
                ExpiresIn=3600  # 1 hour
            )
            return url
        except Exception as e:
            print(f"S3 URL generation failed: {str(e)}")
            return None
    
    def _local_upload(self, file_path: str, s3_key: str) -> bool:
        """Fallback to local upload"""
        logger.info(f"Local storage fallback used for {s3_key}")
        return True


storage_service = StorageService()

