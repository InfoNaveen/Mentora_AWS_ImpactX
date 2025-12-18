"""
Mentora Configuration Module
============================
Centralized configuration with AWS-first design principles.

AWS MIGRATION PATH:
- Secrets → AWS Secrets Manager
- Feature flags → AWS AppConfig
- Environment-specific → AWS Parameter Store
"""
import os
from typing import List, Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET_NAME: str = ""
    AWS_BEDROCK_MODEL_ID: str = "anthropic.claude-3-sonnet-20240229-v1:0"
    AWS_TRANSCRIBE_LANGUAGE_CODE: str = "en-US"
    
    JWT_SECRET_KEY: str = "mentora-jwt-secret-development-only"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 100000000
    
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60
    ENABLE_TELEMETRY: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
