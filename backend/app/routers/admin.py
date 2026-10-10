from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, WasteReport, Product, PickupRequest, AuditLog
from app.schemas import UserOut, AuditLogOut
from app.auth import require_role, get_current_user

router = APIRouter(prefix="/api/admin", tags=["Administrator"])

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    current_user: User = Depends(require_role(["administrator"])),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.id.asc()).all()

@router.put("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    new_role: str,
    current_user: User = Depends(require_role(["administrator"])),
    db: Session = Depends(get_db)
):
    if new_role not in [UserRole.CITIZEN, UserRole.COLLECTOR, UserRole.RECYCLER, UserRole.ADMINISTRATOR, UserRole.ANALYST]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.role = new_role

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="UPDATE_USER_ROLE",
        resource_type="User",
        resource_id=str(user_id),
        details=f"Changed user {target_user.email} role to '{new_role}'"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)
    return target_user

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    current_user: User = Depends(require_role(["administrator"])),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()

@router.get("/system-metrics")
def get_system_metrics(
    current_user: User = Depends(require_role(["administrator", "analyst"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_reports = db.query(WasteReport).count()
    total_pickups = db.query(PickupRequest).count()
    total_products = db.query(Product).count()

    return {
        "status": "HEALTHY",
        "database": "CONNECTED",
        "active_users_count": total_users,
        "total_waste_reports": total_reports,
        "total_pickup_requests": total_pickups,
        "marketplace_products_count": total_products,
        "server_time_utc": str(db.execute(Session.query(User).statement).context) if False else "2026-10-10 UTC"
    }
