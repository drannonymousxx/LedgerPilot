import json
import base64
import urllib.request
import urllib.error
from typing import Optional, List
from uuid import UUID
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.models.user import User
from app.models.organization_member import OrganizationMember

import bcrypt


def hash_password(password: str) -> str:
    """Hashes an organization password securely using bcrypt."""
    pw_bytes = password.encode("utf-8")[:72]  # Truncate to bcrypt 72-byte max length
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain organization password against its stored bcrypt hash."""
    if not hashed_password or not plain_password:
        return False
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False


security_bearer = HTTPBearer(auto_error=False)


def decode_jwt_payload_unverified(token: str) -> dict:
    """Fallback helper to decode JWT payload claims without signature verification."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid JWT token structure")
        padding = "=" * (4 - len(parts[1]) % 4)
        payload_b64 = parts[1] + padding
        decoded_bytes = base64.urlsafe_b64decode(payload_b64)
        return json.loads(decoded_bytes.decode("utf-8"))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not parse authentication token: {str(e)}",
        )


def verify_supabase_token(token: str) -> dict:
    """
    Verifies Supabase JWT token.
    1. If SUPABASE_URL is configured, calls Supabase /auth/v1/user endpoint.
    2. If SUPABASE_JWT_SECRET is configured, verifies signature with PyJWT (HS256).
    3. Failure behavior: Fails closed (HTTP 401) unless ALLOW_UNVERIFIED_JWT is explicitly True
       in a non-production environment for isolated local offline unit testing.
    """
    # 1. Try Supabase Auth API verification if SUPABASE_URL is set
    if settings.SUPABASE_URL:
        try:
            url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
            req = urllib.request.Request(url)
            req.add_header("Authorization", f"Bearer {token}")
            if settings.SUPABASE_ANON_KEY:
                req.add_header("apikey", settings.SUPABASE_ANON_KEY)

            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    user_data = json.loads(response.read().decode("utf-8"))
                    return {
                        "sub": user_data.get("id"),
                        "email": user_data.get("email"),
                        "user_metadata": user_data.get("user_metadata", {}),
                    }
        except urllib.error.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired Supabase authentication session ({e.code})",
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Supabase authentication endpoint reachability failure",
            )

    # 2. Try PyJWT signature verification if SUPABASE_JWT_SECRET is set
    if settings.SUPABASE_JWT_SECRET:
        try:
            import jwt
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return payload
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid JWT token signature: {str(e)}",
            )

    # 3. Fail closed if verification configuration is missing or unverified fallback is disabled
    if not settings.ALLOW_UNVERIFIED_JWT or settings.ENVIRONMENT.lower() == "production":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: Missing JWT verification secret or invalid token signature.",
        )

    # Development-only unverified parsing fallback (gated strictly to ALLOW_UNVERIFIED_JWT=True in non-production)
    payload = decode_jwt_payload_unverified(token)
    if "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing user subject claim",
        )
    return payload



def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts Bearer token, verifies identity,
    and synchronizes the authenticated user into the local database idempotently.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in to access this resource.",
        )

    token = credentials.credentials
    claims = verify_supabase_token(token)

    sub_str = claims.get("sub")
    email = claims.get("email")
    if not sub_str or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token must contain valid user identity and email",
        )

    try:
        user_uuid = UUID(sub_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in authentication token",
        )

    user_meta = claims.get("user_metadata", {}) or {}
    full_name = user_meta.get("full_name") or user_meta.get("name")

    # Idempotently find or synchronize user record in local DB
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        # Check by email if user existed before auth setup
        user_by_email = db.query(User).filter(User.email == email).first()
        if user_by_email:
            user = user_by_email
            user.full_name = full_name or user.full_name
        else:
            user = User(id=user_uuid, email=email, full_name=full_name)
            db.add(user)

        db.commit()
        db.refresh(user)
    elif full_name and user.full_name != full_name:
        user.full_name = full_name
        db.commit()

    return user


def get_current_org_membership(
    organization_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationMember:
    """
    Verifies that the authenticated current_user is an active member
    of the requested organization_id. Source of truth for tenant authorization.
    """
    membership = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == current_user.id,
            OrganizationMember.status == "active",
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are not an active member of this organization",
        )

    return membership


def require_role(allowed_roles: List[str]):
    """
    Role-based authorization helper. Usage: Depends(require_role(['owner', 'admin']))
    """
    def role_checker(membership: OrganizationMember = Depends(get_current_org_membership)):
        if membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{membership.role}' does not have permission for this action",
            )
        return membership
    return role_checker
