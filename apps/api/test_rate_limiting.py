"""
LedgerPilot Rate Limiting Test Suite
Verifies rate limiting enforcement on POST /api/v1/auth/join-org and POST /api/v1/organizations/{id}/password.
"""

import uuid
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.auth import get_current_user
from app.core.db import get_db
from app.models.user import User

client = TestClient(app)

def mock_get_current_user():
    return User(id=uuid.uuid4(), email="rate.limit.test@example.com", full_name="Rate Limit QA User")

def mock_get_db():
    db = MagicMock()
    # Return empty query results so database calls do not fail
    db.query.return_value.filter.return_value.first.return_value = None
    return db

def test_rate_limiting():
    print("==========================================================")
    print("RUNNING RATE LIMITING INTEGRATION TESTS")
    print("==========================================================")

    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        user_id = str(uuid.uuid4())
        headers = {"Authorization": "Bearer mock-token-for-rate-limiting"}

        # 1. Test /api/v1/auth/join-org rate limiting (limit 5/minute)
        rate_limited = False
        for i in range(10):
            resp = client.post("/api/v1/auth/join-org", json={"invite_code_or_id": "nonexistent-org"}, headers=headers)
            print(f"Join-org req {i+1}: status={resp.status_code}")
            if resp.status_code == 429:
                rate_limited = True
                print(f"[PASS] Request {i+1} on /join-org correctly rate limited with HTTP 429 Too Many Requests.")
                break

        assert rate_limited, "Rate limiting was not triggered on /join-org after 10 requests!"

        # 2. Test /api/v1/organizations/{id}/password rate limiting (limit 5/minute)
        org_id = str(uuid.uuid4())
        rate_limited_pass = False
        for i in range(10):
            resp = client.post(f"/api/v1/organizations/{org_id}/password", json={"new_password": "Pass123!Password"}, headers=headers)
            print(f"Set-password req {i+1}: status={resp.status_code}")
            if resp.status_code == 429:
                rate_limited_pass = True
                print(f"[PASS] Request {i+1} on /{org_id}/password correctly rate limited with HTTP 429 Too Many Requests.")
                break

        assert rate_limited_pass, "Rate limiting was not triggered on /organizations/{id}/password after 10 requests!"

        print("==========================================================")
        print("ALL RATE LIMITING TESTS PASSED SUCCESSFULLY!")
        print("==========================================================")
    finally:
        app.dependency_overrides.clear()

if __name__ == "__main__":
    test_rate_limiting()
