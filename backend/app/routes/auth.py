"""
Authentication Routes
=====================
JWT authentication with Supabase integration.

AWS MIGRATION PATH:
- Current: Supabase Auth (temporary)
- Production: Amazon Cognito

RBAC ROLES:
- admin: Full system access
- evaluator: Create and view evaluations
- institution: View reports for their institution
- demo: Limited access for hackathon demo
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional
import uuid

from ..core.security import (
    create_jwt_token, 
    get_current_user, 
    User, 
    UserRole,
    ROLE_PERMISSIONS
)
from ..core.config import settings

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "evaluator"
    institution_id: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    expires_in: int


class UserProfile(BaseModel):
    id: str
    email: str
    role: str
    permissions: list
    institution_id: Optional[str] = None


DEMO_USERS = {
    "admin@mentora.ai": {
        "id": "admin-001",
        "password": "admin123",
        "role": "admin",
        "name": "Admin User"
    },
    "evaluator@mentora.ai": {
        "id": "evaluator-001",
        "password": "eval123",
        "role": "evaluator",
        "name": "Test Evaluator"
    },
    "demo@mentora.ai": {
        "id": "demo-001",
        "password": "demo123",
        "role": "demo",
        "name": "Demo User"
    }
}


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return JWT token.
    
    DEMO MODE: Uses in-memory users for hackathon.
    PRODUCTION: Validates against Supabase/Cognito.
    """
    user_data = DEMO_USERS.get(request.email)
    
    if not user_data or user_data["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_jwt_token(
        user_id=user_data["id"],
        email=request.email,
        role=user_data["role"]
    )
    
    return AuthResponse(
        access_token=token,
        user={
            "id": user_data["id"],
            "email": request.email,
            "name": user_data["name"],
            "role": user_data["role"],
            "permissions": ROLE_PERMISSIONS.get(
                UserRole(user_data["role"]), []
            )
        },
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600
    )


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """
    Register new user account.
    
    DEMO MODE: Creates in-memory user.
    PRODUCTION: Creates user in Supabase/Cognito.
    """
    if request.email in DEMO_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    role = request.role if request.role in ["evaluator", "institution"] else "evaluator"
    
    DEMO_USERS[request.email] = {
        "id": user_id,
        "password": request.password,
        "role": role,
        "name": request.name
    }
    
    token = create_jwt_token(
        user_id=user_id,
        email=request.email,
        role=role
    )
    
    return AuthResponse(
        access_token=token,
        user={
            "id": user_id,
            "email": request.email,
            "name": request.name,
            "role": role,
            "permissions": ROLE_PERMISSIONS.get(UserRole(role), [])
        },
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600
    )


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserProfile(
        id=user.id,
        email=user.email,
        role=user.role.value,
        permissions=user.permissions,
        institution_id=user.institution_id
    )


@router.post("/demo-token")
async def get_demo_token():
    """
    Get a demo token for unauthenticated testing.
    
    This endpoint allows judges to quickly test the system
    without going through registration.
    """
    token = create_jwt_token(
        user_id="demo-hackathon",
        email="judge@hackathon.aws",
        role="demo"
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Demo token for hackathon testing",
        "user": {
            "id": "demo-hackathon",
            "email": "judge@hackathon.aws",
            "role": "demo",
            "permissions": ROLE_PERMISSIONS[UserRole.DEMO]
        },
        "note": "This token is for demonstration purposes only"
    }


@router.get("/roles")
async def get_available_roles():
    """Get available user roles and their permissions."""
    return {
        "roles": [
            {
                "name": role.value,
                "permissions": permissions,
                "description": {
                    "admin": "Full system access - manage users, institutions, all evaluations",
                    "evaluator": "Create and view teaching evaluations",
                    "institution": "View reports for their institution",
                    "demo": "Limited access for testing"
                }.get(role.value, "")
            }
            for role, permissions in ROLE_PERMISSIONS.items()
        ]
    }
