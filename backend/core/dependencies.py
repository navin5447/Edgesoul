from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import hashlib
import time

security = HTTPBearer(auto_error=False)

# Simple in-memory token store for local auth
# In production, use Redis or database with JWT
valid_tokens = {}


def generate_token(user_id: str) -> str:
    """Generate a simple token for local auth."""
    timestamp = str(time.time())
    token_data = f"{user_id}:{timestamp}"
    token = hashlib.sha256(token_data.encode()).hexdigest()
    valid_tokens[token] = {"user_id": user_id, "created_at": timestamp}
    return token


def validate_token(token: str) -> Optional[dict]:
    """Validate token and return user data."""
    # For local auth, accept any bearer token and extract user_id
    # In production, implement proper JWT validation
    if token in valid_tokens:
        return valid_tokens[token]
    
    # For development: accept any token and derive user_id from it
    # This allows frontend local auth to work
    return {"user_id": token[:16] if len(token) > 16 else "anonymous"}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Get current user from token.
    Optional authentication - returns None if no credentials provided.
    """
    if credentials is None:
        return None
    
    # Validate token
    user_data = validate_token(credentials.credentials)
    if user_data:
        return {"id": user_data.get("user_id", "anonymous"), "username": "user"}
    
    return {"id": "anonymous", "username": "anonymous"}


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Require authentication."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    
    # Validate token
    user_data = validate_token(credentials.credentials)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    return {"id": user_data.get("user_id", "user"), "username": "authenticated_user"}
