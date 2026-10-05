"""
LedgerPilot Authentication & Security Unit Test Suite
Validates fail-closed JWT signature verification, forged token rejection,
missing secret behavior, and production environment safety gates.
"""

import uuid
import jwt
from fastapi import HTTPException
from app.core.config import settings
from app.core.auth import verify_supabase_token

def test_jwt_auth_security():
    print("==========================================================")
    print("RUNNING JWT AUTHENTICATION SECURITY UNIT TESTS")
    print("==========================================================")

    secret = "test-secret-key-1234567890-super-secure"
    user_id = str(uuid.uuid4())
    user_email = "test.user@example.com"

    # Create valid signed JWT
    valid_payload = {"sub": user_id, "email": user_email, "role": "authenticated"}
    valid_token = jwt.encode(valid_payload, secret, algorithm="HS256")

    # Create forged JWT (signed with wrong secret)
    forged_token = jwt.encode(valid_payload, "wrong-secret-key", algorithm="HS256")

    # 1. TEST VALID SIGNATURE VERIFICATION
    settings.SUPABASE_JWT_SECRET = secret
    settings.SUPABASE_URL = None
    settings.ALLOW_UNVERIFIED_JWT = False
    settings.ENVIRONMENT = "development"

    decoded = verify_supabase_token(valid_token)
    assert decoded["sub"] == user_id
    assert decoded["email"] == user_email
    print("[PASS] Test 1: Valid JWT token successfully authenticated via PyJWT signature verification.")

    # 2. TEST FORGED TOKEN REJECTION
    forged_failed = False
    try:
        verify_supabase_token(forged_token)
    except HTTPException as e:
        assert e.status_code == 401
        forged_failed = True
    assert forged_failed, "Forged token was accepted!"
    print("[PASS] Test 2: Forged token (invalid signature) was rejected with HTTP 401 Unauthorized.")

    # 3. TEST MALFORMED TOKEN REJECTION
    malformed_failed = False
    try:
        verify_supabase_token("not.a.valid.jwt.string")
    except HTTPException as e:
        assert e.status_code == 401
        malformed_failed = True
    assert malformed_failed, "Malformed token was accepted!"
    print("[PASS] Test 3: Malformed token was rejected with HTTP 401 Unauthorized.")

    # 4. TEST MISSING SECRET -> FAIL CLOSED (ALLOW_UNVERIFIED_JWT = False)
    settings.SUPABASE_JWT_SECRET = None
    settings.ALLOW_UNVERIFIED_JWT = False
    settings.ENVIRONMENT = "development"

    missing_secret_failed = False
    try:
        verify_supabase_token(valid_token)
    except HTTPException as e:
        assert e.status_code == 401
        assert "Missing JWT verification secret" in e.detail or "failed" in e.detail
        missing_secret_failed = True
    assert missing_secret_failed, "Unverified token was accepted when secret was missing!"
    print("[PASS] Test 4: Missing secret fails closed with HTTP 401 (unverified fallback blocked).")

    # 5. TEST PRODUCTION ENVIRONMENT GATE
    settings.SUPABASE_JWT_SECRET = None
    settings.ALLOW_UNVERIFIED_JWT = True  # Attempt to force fallback in production
    settings.ENVIRONMENT = "production"

    prod_gate_failed = False
    try:
        verify_supabase_token(valid_token)
    except HTTPException as e:
        assert e.status_code == 401
        prod_gate_failed = True
    assert prod_gate_failed, "Unverified token fallback allowed in production environment!"
    print("[PASS] Test 5: Production environment gate strictly blocks unverified fallback even if flag enabled.")

    # Reset settings to default
    settings.SUPABASE_JWT_SECRET = None
    settings.ALLOW_UNVERIFIED_JWT = True  # Allowed for local offline e2e script execution
    settings.ENVIRONMENT = "development"

    print("==========================================================")
    print("ALL JWT SECURITY TESTS PASSED SUCCESSFULLY!")
    print("==========================================================")

if __name__ == "__main__":
    test_jwt_auth_security()
