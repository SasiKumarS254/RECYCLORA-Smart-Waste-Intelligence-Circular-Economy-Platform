from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    WasteReport, ReportStatusHistory, CleanupEvent, EventRegistration,
    EducationalContent, QuizAttempt, User, Notification
)
from app.schemas import (
    WasteReportCreate, WasteReportStatusUpdate, WasteReportOut,
    CleanupEventCreate, CleanupEventOut, QuizAttemptSubmit, QuizAttemptOut
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/civic", tags=["CivicCare"])

# --- WASTE REPORTS ---
@router.post("/reports", response_model=WasteReportOut)
def create_report(
    report_in: WasteReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = WasteReport(
        reporter_id=current_user.id,
        category=report_in.category,
        description=report_in.description,
        image_url=report_in.image_url,
        address=report_in.address,
        area=report_in.area,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        urgency=report_in.urgency,
        status="submitted"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Status history log
    history = ReportStatusHistory(
        report_id=report.id,
        status="submitted",
        notes=f"Report created by {current_user.full_name}",
        updated_by_id=current_user.id
    )
    db.add(history)

    # In-app notification to reporter
    notif = Notification(
        user_id=current_user.id,
        title="Waste Report Submitted",
        message=f"Your report #{report.id} ({report.category}) has been logged successfully.",
        category="report",
        action_link="/civiccare"
    )
    db.add(notif)
    db.commit()
    db.refresh(report)
    return report

@router.get("/reports", response_model=List[WasteReportOut])
def get_reports(
    status_filter: Optional[str] = None,
    area_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(WasteReport)
    # If citizen, return their reports or area reports
    if current_user.role == "citizen":
        query = query.filter(WasteReport.reporter_id == current_user.id)
    if status_filter:
        query = query.filter(WasteReport.status == status_filter)
    if area_filter:
        query = query.filter(WasteReport.area == area_filter)
    
    return query.order_by(WasteReport.created_at.desc()).all()

@router.put("/reports/{report_id}/status", response_model=WasteReportOut)
def update_report_status(
    report_id: int,
    status_in: WasteReportStatusUpdate,
    current_user: User = Depends(require_role(["administrator", "collector"])),
    db: Session = Depends(get_db)
):
    report = db.query(WasteReport).filter(WasteReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = status_in.status
    if status_in.assigned_collector_id is not None:
        report.assigned_collector_id = status_in.assigned_collector_id

    history = ReportStatusHistory(
        report_id=report.id,
        status=status_in.status,
        notes=status_in.notes or f"Status updated to {status_in.status} by {current_user.full_name}",
        updated_by_id=current_user.id
    )
    db.add(history)

    # Notify reporter
    notif = Notification(
        user_id=report.reporter_id,
        title=f"Report #{report.id} Updated",
        message=f"Status changed to '{status_in.status}'. Notes: {status_in.notes or 'No additional notes'}",
        category="report",
        action_link="/civiccare"
    )
    db.add(notif)
    db.commit()
    db.refresh(report)
    return report

# --- CLEANUP EVENTS ---
@router.get("/events", response_model=List[CleanupEventOut])
def get_cleanup_events(db: Session = Depends(get_db)):
    return db.query(CleanupEvent).order_by(CleanupEvent.event_date.asc()).all()

@router.post("/events", response_model=CleanupEventOut)
def create_cleanup_event(
    event_in: CleanupEventCreate,
    current_user: User = Depends(require_role(["administrator"])),
    db: Session = Depends(get_db)
):
    event = CleanupEvent(
        title=event_in.title,
        description=event_in.description,
        location_name=event_in.location_name,
        area=event_in.area,
        event_date=event_in.event_date,
        organizer_id=current_user.id,
        max_volunteers=event_in.max_volunteers,
        badge_earned=event_in.badge_earned,
        latitude=event_in.latitude,
        longitude=event_in.longitude,
        status="upcoming"
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.post("/events/{event_id}/register")
def register_for_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(CleanupEvent).filter(CleanupEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == current_user.id
    ).first()
    if existing:
        return {"message": "Already registered for this event", "status": "registered"}

    reg = EventRegistration(event_id=event_id, user_id=current_user.id, status="registered")
    event.registered_count += 1
    current_user.badge_count += 1
    db.add(reg)
    db.commit()

    return {"message": f"Successfully registered for '{event.title}'! Badge candidate awarded.", "status": "registered"}

# --- EDUCATIONAL MODULES & QUIZZES ---
@router.get("/education")
def get_education_modules(db: Session = Depends(get_db)):
    return db.query(EducationalContent).all()

@router.post("/quiz", response_model=QuizAttemptOut)
def submit_quiz(
    quiz_in: QuizAttemptSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    passed = (quiz_in.score / quiz_in.total_questions) >= 0.7
    attempt = QuizAttempt(
        user_id=current_user.id,
        module=quiz_in.module,
        score=quiz_in.score,
        total_questions=quiz_in.total_questions,
        passed=passed
    )
    if passed:
        current_user.badge_count += 1
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt

# --- AREA CLEANLINESS INDICATORS ---
@router.get("/cleanliness-indicators")
def get_cleanliness_indicators(db: Session = Depends(get_db)):
    # Calculate cleanliness scores based on actual reports & resolution rates per area
    areas = ["Sector 4", "Sector 7", "Industrial Zone B", "South Central", "North Central", "West Zone"]
    indicators = []
    for area in areas:
        total_reports = db.query(WasteReport).filter(WasteReport.area == area).count()
        resolved_reports = db.query(WasteReport).filter(WasteReport.area == area, WasteReport.status == "resolved").count()
        resolution_rate = (resolved_reports / total_reports * 100.0) if total_reports > 0 else 85.0
        score = min(100.0, max(50.0, round(70.0 + (resolution_rate * 0.3) - (total_reports * 2), 1)))

        indicators.append({
            "area": area,
            "cleanliness_score": score,
            "total_reports_count": total_reports,
            "resolved_reports_count": resolved_reports,
            "status_label": "Excellent" if score >= 85 else ("Good" if score >= 70 else "Needs Attention"),
            "data_source_label": "Calculated from application records & municipal indicators"
        })
    return indicators
