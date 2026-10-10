import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models import User, UserRole
from app.auth import hash_password, create_access_token
from app.services.forecasting import generate_waste_forecast

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_recyclora.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Seed test database users directly
with TestingSessionLocal() as test_db:
    citizen = User(
        email="citizen_test@recyclora.org",
        hashed_password=hash_password("Citizen123!"),
        full_name="Test Citizen",
        role=UserRole.CITIZEN,
        area="Sector 4"
    )
    collector = User(
        email="collector_test@recyclora.org",
        hashed_password=hash_password("Collector123!"),
        full_name="Test Collector",
        role=UserRole.COLLECTOR,
        area="Sector 4"
    )
    admin = User(
        email="admin_test@recyclora.org",
        hashed_password=hash_password("Admin123!"),
        full_name="Test Admin",
        role=UserRole.ADMINISTRATOR,
        area="Sector 4"
    )
    test_db.add_all([citizen, collector, admin])
    test_db.commit()

client = TestClient(app)

def get_auth_headers(email="citizen_test@recyclora.org", password="Citizen123!"):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_login_success():
    res = client.post("/api/auth/login", json={"email": "admin_test@recyclora.org", "password": "Admin123!"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "administrator"

def test_waste_report_flow():
    headers = get_auth_headers("citizen_test@recyclora.org", "Citizen123!")
    # Create report
    res = client.post("/api/civic/reports", json={
        "category": "illegal dumping",
        "description": "Test garbage dumped behind park gate",
        "address": "Park View Lane",
        "area": "Sector 4",
        "urgency": "high"
    }, headers=headers)
    assert res.status_code == 200
    report_id = res.json()["id"]

    # Admin status update
    admin_headers = get_auth_headers("admin_test@recyclora.org", "Admin123!")
    up_res = client.put(f"/api/civic/reports/{report_id}/status", json={
        "status": "assigned",
        "notes": "Assigned maintenance crew"
    }, headers=admin_headers)
    assert up_res.status_code == 200
    assert up_res.json()["status"] == "assigned"

def test_pickup_and_collection_record():
    headers = get_auth_headers("citizen_test@recyclora.org", "Citizen123!")
    p_res = client.post("/api/collection/requests", json={
        "category": "plastic",
        "estimated_weight_kg": 14.5,
        "time_slot": "Morning (8-11 AM)",
        "scheduled_date": "2026-10-20",
        "address": "42 Green Park Extension",
        "area": "Sector 4"
    }, headers=headers)
    assert p_res.status_code == 200
    pickup_id = p_res.json()["id"]

    collector_headers = get_auth_headers("collector_test@recyclora.org", "Collector123!")
    rec_res = client.post("/api/collection/records", json={
        "pickup_request_id": pickup_id,
        "actual_weight_kg": 15.2,
        "category": "plastic",
        "qr_code_verified": True,
        "segregation_score": 96
    }, headers=collector_headers)
    assert rec_res.status_code == 200
    assert rec_res.json()["actual_weight_kg"] == 15.2

def test_production_cost_calculator():
    res = client.post("/api/circular/cost-calculator", json={
        "material_cost": 100.0,
        "labor_hours": 2.0,
        "labor_rate_per_hour": 150.0,
        "packaging_cost": 50.0,
        "overhead_cost": 20.0,
        "markup_percentage": 25.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["total_cost"] == 470.0
    assert data["suggested_selling_price"] == 587.5

def test_forecasting_service():
    records = [
        {"date": f"2026-09-{i:02d}", "weight_kg": 100.0 + i * 2.0} for i in range(1, 20)
    ]
    res = generate_waste_forecast(records, forecast_days=7)
    assert res.model_name is not None
    assert len(res.forecast) == 7
    assert "MAE" in res.validation_metrics

def test_global_search():
    res = client.get("/api/search?q=plastic")
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
