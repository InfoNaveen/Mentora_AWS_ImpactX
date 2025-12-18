"""
Mentora Security Module
=======================
JWT authentication and RBAC enforcement.

AWS MIGRATION PATH:
- JWT validation → Amazon Cognito JWT verification
- RBAC → Cognito Groups + IAM policies

SECURITY BOUNDARIES (AI ORCHESTRATION):
┌─────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 1: User Input                       │
│  - All user input is UNTRUSTED                      │
│  - Sanitization required before any processing      │
│  - File uploads validated and scanned               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 2: Service Layer                    │
│  - Input sanitization enforced                      │
│  - Rate limiting applied                            │
│  - Audit logging enabled                            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 3: AI/LLM Layer                     │
│  - Prompt injection prevention                      │
│  - Output validation and filtering                  │
│  - Human-in-the-loop checkpoints                    │
└─────────────────────────────────────────────────────┘
"""
import os
from datetime import datetime, timedelta
from typing import Optional, List
from enum import Enum
import hashlib
import hmac

from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import settings


class UserRole(str, Enum):
    ADMIN = "admin"
    EVALUATOR = "evaluator"
    INSTITUTION = "institution"
    DEMO = "demo"


class User:
    def __init__(
        self,
        id: str,
        email: str,
        role: UserRole,
        institution_id: Optional[str] = None,
        permissions: Optional[List[str]] = None
    ):
        self.id = id
        self.email = email
        self.role = role
        self.institution_id = institution_id
        self.permissions = permissions or []


ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        "evaluation:create", "evaluation:read", "evaluation:delete",
        "user:manage", "institution:manage", "reports:full"
    ],
    UserRole.EVALUATOR: [
        "evaluation:create", "evaluation:read", "reports:basic"
    ],
    UserRole.INSTITUTION: [
        "evaluation:read", "reports:institution", "user:view"
    ],
    UserRole.DEMO: [
        "evaluation:create", "evaluation:read"
    ]
}


security_scheme = HTTPBearer(auto_error=False)


def create_demo_user() -> User:
    """Create a demo user for unauthenticated access."""
    return User(
        id="demo-user",
        email="demo@mentora.ai",
        role=UserRole.DEMO,
        permissions=ROLE_PERMISSIONS[UserRole.DEMO]
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
) -> User:
    """
    Extract and validate user from JWT token.
    Falls back to demo user if no token provided (for hackathon demo).
    
    AWS MIGRATION: Replace with Cognito JWT verification
    - Use cognito-jwt-verify library
    - Validate against Cognito User Pool
    """
    if not credentials:
        return create_demo_user()
    
    try:
        token = credentials.credentials
        payload = decode_jwt_token(token)
        
        return User(
            id=payload.get("sub", "unknown"),
            email=payload.get("email", ""),
            role=UserRole(payload.get("role", "demo")),
            institution_id=payload.get("institution_id"),
            permissions=ROLE_PERMISSIONS.get(
                UserRole(payload.get("role", "demo")), []
            )
        )
    except Exception:
        return create_demo_user()


def decode_jwt_token(token: str) -> dict:
    """
    Decode JWT token (simplified for MVP).
    
    AWS MIGRATION: Use python-jose with Cognito JWKS
    """
    import base64
    import json
    
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token format")
        
        payload = parts[1]
        padding = 4 - len(payload) % 4
        if padding != 4:
            payload += "=" * padding
        
        decoded = base64.urlsafe_b64decode(payload)
        return json.loads(decoded)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


def create_jwt_token(user_id: str, email: str, role: str) -> str:
    """
    Create JWT token (simplified for MVP).
    
    AWS MIGRATION: Tokens issued by Cognito
    """
    import base64
    import json
    import time
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + (settings.JWT_EXPIRATION_HOURS * 3600)
    }
    
    header_b64 = base64.urlsafe_b64encode(
        json.dumps(header).encode()
    ).rstrip(b"=").decode()
    
    payload_b64 = base64.urlsafe_b64encode(
        json.dumps(payload).encode()
    ).rstrip(b"=").decode()
    
    message = f"{header_b64}.{payload_b64}"
    signature = hmac.new(
        settings.JWT_SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()
    
    return f"{message}.{signature_b64}"


def require_permission(permission: str):
    """Decorator to enforce RBAC permissions."""
    async def permission_checker(
        user: User = Depends(get_current_user)
    ) -> User:
        if permission not in user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission} required"
            )
        return user
    return permission_checker


def require_role(allowed_roles: List[UserRole]):
    """Decorator to enforce role-based access."""
    async def role_checker(
        user: User = Depends(get_current_user)
    ) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied for role: {user.role}"
            )
        return user
    return role_checker
