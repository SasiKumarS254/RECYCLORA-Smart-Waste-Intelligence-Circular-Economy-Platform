from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    PickupRequest, CollectionAssignment, CollectionRecord,
    BinReading, DrainReport, User, Notification
)
from app.schemas import (
    PickupRequestCreate, PickupRequestOut, CollectionAssignmentCreate,
    CollectionAssignmentOut, CollectionRecordCreate, CollectionRecordOut,
    BinReadingOut, DrainReportCreate, DrainReportStatusUpdate, DrainReportOut
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/collection", tags=["WasteFlow"])

# --- PICKUP REQUESTS ---
@router.post("/requests", response_model=PickupRequestOut)
def create_pickup_request(
    request_in: PickupRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pickup = PickupRequest(
        citizen_id=current_user.id,
        category=request_in.category,
        estimated_weight_kg=request_in.estimated_weight_kg,
        time_slot=request_in.time_slot,
        scheduled_date=request_in.scheduled_date,
        address=request_in.address,
        area=request_in.area,
        latitude=request_in.latitude,
        longitude=request_in.longitude,
        notes=request_in.notes,
        status="requested"
    )
    db.add(pickup)
    db.commit()
    db.refresh(pickup)

    # In-app notification
    notif = Notification(
        user_id=current_user.id,
        title="Pickup Requested",
        message=f"Pickup #{pickup.id} ({pickup.category}, {pickup.estimated_weight_kg}kg) requested for {pickup.scheduled_date}.",
        category="collection",
        action_link="/wasteflow"
    )
    db.add(notif)
    db.commit()
    db.refresh(pickup)
    return pickup

@router.get("/requests", response_model=List[PickupRequestOut])
def get_pickup_requests(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PickupRequest)
    if current_user.role == "citizen":
        query = query.filter(PickupRequest.citizen_id == current_user.id)
    if status_filter:
        query = query.filter(PickupRequest.status == status_filter)
    return query.order_by(PickupRequest.created_at.desc()).all()

# --- COLLECTION ASSIGNMENTS & COMPLETION ---
@router.post("/assignments", response_model=CollectionAssignmentOut)
def assign_collector(
    assign_in: CollectionAssignmentCreate,
    current_user: User = Depends(require_role(["administrator"])),
    db: Session = Depends(get_db)
):
    pickup = db.query(PickupRequest).filter(PickupRequest.id == assign_in.pickup_request_id).first()
    if not pickup:
        raise HTTPException(status_code=404, detail="Pickup request not found")

    pickup.status = "scheduled"

    assignment = CollectionAssignment(
        pickup_request_id=assign_in.pickup_request_id,
        collector_id=assign_in.collector_id,
        vehicle_details=assign_in.vehicle_details,
        scheduled_time=assign_in.scheduled_time,
        status="assigned"
    )
    db.add(assignment)

    # Notify collector
    notif = Notification(
        user_id=assign_in.collector_id,
        title="New Pickup Task Assigned",
        message=f"You have been assigned pickup task #{pickup.id} ({pickup.category}) at {assign_in.scheduled_time}.",
        category="collection",
        action_link="/wasteflow"
    )
    db.add(notif)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/collector-assignments", response_model=List[CollectionAssignmentOut])
def get_collector_assignments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CollectionAssignment)
    if current_user.role == "collector":
        query = query.filter(CollectionAssignment.collector_id == current_user.id)
    return query.order_by(CollectionAssignment.assigned_at.desc()).all()

@router.post("/records", response_model=CollectionRecordOut)
def record_completed_pickup(
    record_in: CollectionRecordCreate,
    current_user: User = Depends(require_role(["collector", "administrator"])),
    db: Session = Depends(get_db)
):
    record = CollectionRecord(
        assignment_id=record_in.assignment_id,
        pickup_request_id=record_in.pickup_request_id,
        collector_id=current_user.id,
        actual_weight_kg=record_in.actual_weight_kg,
        category=record_in.category,
        qr_code_verified=record_in.qr_code_verified,
        waste_report_id=record_in.waste_report_id,
        segregation_score=record_in.segregation_score,
        notes=record_in.notes
    )
    db.add(record)

    if record_in.assignment_id:
        assignment = db.query(CollectionAssignment).filter(CollectionAssignment.id == record_in.assignment_id).first()
        if assignment:
            assignment.status = "completed"
            assignment.completed_at = assignment.completed_at or assignment.assigned_at
            if assignment.pickup_request:
                assignment.pickup_request.status = "completed"
                # Notify citizen
                notif = Notification(
                    user_id=assignment.pickup_request.citizen_id,
                    title="Pickup Completed with QR Verification!",
                    message=f"Pickup #{assignment.pickup_request.id} completed. Weight logged: {record_in.actual_weight_kg} kg.",
                    category="collection",
                    action_link="/wasteflow"
                )
                db.add(notif)

    db.commit()
    db.refresh(record)
    return record

# --- SMART BINS ---
@router.get("/bins", response_model=List[BinReadingOut])
def get_bin_readings(db: Session = Depends(get_db)):
    return db.query(BinReading).order_by(BinReading.current_fill_pct.desc()).all()

# --- DRAIN MONITORING ---
@router.post("/drains", response_model=DrainReportOut)
def report_drain_issue(
    drain_in: DrainReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    drain = DrainReport(
        reporter_id=current_user.id,
        title=drain_in.title,
        location_name=drain_in.location_name,
        area=drain_in.area,
        severity=drain_in.severity,
        description=drain_in.description,
        image_url=drain_in.image_url,
        latitude=drain_in.latitude,
        longitude=drain_in.longitude,
        status="reported"
    )
    db.add(drain)
    db.commit()
    db.refresh(drain)
    return drain

@router.get("/drains", response_model=List[DrainReportOut])
def get_drain_reports(db: Session = Depends(get_db)):
    return db.query(DrainReport).order_by(DrainReport.created_at.desc()).all()

@router.put("/drains/{drain_id}/status", response_model=DrainReportOut)
def update_drain_status(
    drain_id: int,
    update_in: DrainReportStatusUpdate,
    current_user: User = Depends(require_role(["administrator", "collector"])),
    db: Session = Depends(get_db)
):
    drain = db.query(DrainReport).filter(DrainReport.id == drain_id).first()
    if not drain:
        raise HTTPException(status_code=404, detail="Drain report not found")

    drain.status = update_in.status
    if update_in.assigned_to:
        drain.assigned_to = update_in.assigned_to

    db.commit()
    db.refresh(drain)
    return drain
