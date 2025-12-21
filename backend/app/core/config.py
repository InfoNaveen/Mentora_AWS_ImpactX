"""
Mentora Configuration Module
============================
Centralized configuration with AWS-first design principles.
"""
import os
from typing import List


class Settings:
    def __init__(self):
        self.APP_ENV = os.getenv("APP_ENV", "development")
        self.DEBUG = os.getenv("DEBUG", "true").lower() == "true"
        
        self.SUPABASE_URL = os.getenv("SUPABASE_URL", "")
        self.SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
        self.SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        
        self.AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
        self.AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        self.AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
        self.AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME", "")
        self.AWS_BEDROCK_MODEL_ID = os.getenv("AWS_BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")
        self.AWS_TRANSCRIBE_LANGUAGE_CODE = os.getenv("AWS_TRANSCRIBE_LANGUAGE_CODE", "en-US")
        
        self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "mentora-jwt-secret-development-only")
        self.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
        self.JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
        
        self.CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
        
        self.UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
        self.MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "100000000"))
        
        self.RATE_LIMIT_REQUESTS_PER_MINUTE = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "60"))
        self.ENABLE_TELEMETRY = os.getenv("ENABLE_TELEMETRY", "true").lower() == "true"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
