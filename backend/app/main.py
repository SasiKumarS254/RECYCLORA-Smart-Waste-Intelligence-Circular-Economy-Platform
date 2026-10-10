import os
from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db
from app.routers import auth, civic, collection, circular, analytics, notifications, admin
from app.services.seed_data import seed_database
from app.models import WasteReport, PickupRequest, Product, EducationalContent, CountryProfile

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="A Cloud-Based Intelligent Waste Management, Recycling, Reuse and Circular Economy Analytics Platform",
    version="1.0.0"
)

# Enable CORS for local dev & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads directory static mounting
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Auto-seed initial demo accounts & records on startup
@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()

# Mount API Routers
app.include_router(auth.router)
app.include_router(civic.router)
app.include_router(collection.router)
app.include_router(circular.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.ENV
    }

# GLOBAL SEARCH ENDPOINT
@app.get("/api/search")
def global_search(
    q: str = Query(..., min_length=2, description="Search query term"),
    db: Session = Depends(get_db)
):
    query_term = f"%{q}%"

    reports = db.query(WasteReport).filter(
        (WasteReport.description.ilike(query_term)) | (WasteReport.category.ilike(query_term)) | (WasteReport.area.ilike(query_term))
    ).limit(5).all()

    pickups = db.query(PickupRequest).filter(
        (PickupRequest.category.ilike(query_term)) | (PickupRequest.notes.ilike(query_term)) | (PickupRequest.address.ilike(query_term))
    ).limit(5).all()

    products = db.query(Product).filter(
        (Product.title.ilike(query_term)) | (Product.description.ilike(query_term)) | (Product.material_type.ilike(query_term))
    ).limit(5).all()

    education = db.query(EducationalContent).filter(
        (EducationalContent.title.ilike(query_term)) | (EducationalContent.summary.ilike(query_term)) | (EducationalContent.module.ilike(query_term))
    ).limit(5).all()

    countries = db.query(CountryProfile).filter(
        (CountryProfile.country_name.ilike(query_term)) | (CountryProfile.case_study_title.ilike(query_term))
    ).limit(5).all()

    return {
        "query": q,
        "results": {
            "reports": [{"id": r.id, "title": f"Report #{r.id} ({r.category})", "subtitle": r.area, "link": "/civiccare"} for r in reports],
            "pickups": [{"id": p.id, "title": f"Pickup #{p.id} ({p.category})", "subtitle": f"{p.estimated_weight_kg}kg - {p.status}", "link": "/wasteflow"} for p in pickups],
            "products": [{"id": pr.id, "title": pr.title, "subtitle": f"₹{pr.price} - {pr.material_type}", "link": "/circulab"} for pr in products],
            "education": [{"id": e.id, "title": e.title, "subtitle": f"Module: {e.module.upper()}", "link": "/civiccare"} for e in education],
            "countries": [{"id": c.id, "title": c.country_name, "subtitle": c.case_study_title, "link": "/earthscope"} for c in countries]
        }
    }
