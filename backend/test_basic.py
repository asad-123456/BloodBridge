import pytest
from fastapi.testclient import TestClient
from main import app
from src.utils.helpers import verify_password, hash_password
from datetime import datetime, timezone, timedelta
import math

client = TestClient(app)

def test_auth_hashing():
    password = "SuperSecretPassword123!"
    hashed = hash_password(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)

def test_health_endpoint():
    response = client.get("/")
    # Even if it's not defined, or if it redirects, we just want to see it doesn't crash 500
    assert response.status_code in [200, 404, 307]

def test_app_loads():
    # If this runs, it means the dependency graph and routers are intact.
    assert app.title == "BloodBridge"
