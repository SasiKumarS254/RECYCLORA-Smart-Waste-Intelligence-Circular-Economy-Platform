from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import datetime

# --- AUTH & USER ---
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "citizen"
    phone: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = "Sector 4"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    area: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: int
    badge_count: int = 0
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

# --- WASTE REPORT & STATUS HISTORY ---
class WasteReportCreate(BaseModel):
    category: str
    description: str
    image_url: Optional[str] = None
    address: str
    area: str = "Sector 4"
    latitude: float = 28.6139
    longitude: float = 77.2090
    urgency: str = "medium"

class WasteReportStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    assigned_collector_id: Optional[int] = None

class StatusHistoryOut(BaseModel):
    id: int
    status: str
    notes: Optional[str] = None
    updated_by_id: Optional[int] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

class WasteReportOut(WasteReportCreate):
    id: int
    reporter_id: int
    status: str
    assigned_collector_id: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    reporter: Optional[UserOut] = None
    collector: Optional[UserOut] = None
    status_history: List[StatusHistoryOut] = []

    class Config:
        from_attributes = True

# --- PICKUP REQUEST & COLLECTION ---
class PickupRequestCreate(BaseModel):
    category: str
    estimated_weight_kg: float
    time_slot: str
    scheduled_date: str
    address: str
    area: str = "Sector 4"
    latitude: float = 28.6139
    longitude: float = 77.2090
    notes: Optional[str] = None

class CollectionAssignmentCreate(BaseModel):
    pickup_request_id: int
    collector_id: int
    vehicle_details: str = "EV Truck - WB02-9981"
    scheduled_time: str

class CollectionRecordCreate(BaseModel):
    assignment_id: Optional[int] = None
    pickup_request_id: Optional[int] = None
    actual_weight_kg: float
    category: str
    qr_code_verified: bool = True
    waste_report_id: Optional[int] = None
    segregation_score: int = 95
    notes: Optional[str] = None

class CollectionAssignmentOut(BaseModel):
    id: int
    pickup_request_id: int
    collector_id: int
    vehicle_details: str
    scheduled_time: str
    status: str
    assigned_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    collector: Optional[UserOut] = None

    class Config:
        from_attributes = True

class PickupRequestOut(PickupRequestCreate):
    id: int
    citizen_id: int
    status: str
    created_at: datetime.datetime
    citizen: Optional[UserOut] = None
    assignment: Optional[CollectionAssignmentOut] = None

    class Config:
        from_attributes = True

class CollectionRecordOut(CollectionRecordCreate):
    id: int
    collector_id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# --- BINS & DRAINS ---
class BinReadingOut(BaseModel):
    id: int
    bin_code: str
    location_name: str
    area: str
    capacity_liters: int
    current_fill_pct: float
    battery_pct: float
    status: str
    latitude: float
    longitude: float
    last_updated: datetime.datetime

    class Config:
        from_attributes = True

class DrainReportCreate(BaseModel):
    title: str
    location_name: str
    area: str
    severity: str = "medium"
    description: str
    image_url: Optional[str] = None
    latitude: float = 28.6139
    longitude: float = 77.2090

class DrainReportStatusUpdate(BaseModel):
    status: str
    assigned_to: Optional[str] = None

class DrainReportOut(DrainReportCreate):
    id: int
    reporter_id: int
    status: str
    assigned_to: Optional[str] = None
    created_at: datetime.datetime
    reporter: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- CLEANUP EVENTS & QUIZZES ---
class CleanupEventCreate(BaseModel):
    title: str
    description: str
    location_name: str
    area: str
    event_date: str
    max_volunteers: int = 50
    badge_earned: str = "Eco Warrior"
    latitude: float = 28.6139
    longitude: float = 77.2090

class CleanupEventOut(CleanupEventCreate):
    id: int
    organizer_id: int
    registered_count: int
    status: str
    created_at: datetime.datetime
    organizer: Optional[UserOut] = None

    class Config:
        from_attributes = True

class QuizAttemptSubmit(BaseModel):
    module: str
    score: int
    total_questions: int

class QuizAttemptOut(QuizAttemptSubmit):
    id: int
    user_id: int
    passed: bool
    completed_at: datetime.datetime

    class Config:
        from_attributes = True

# --- CIRCULAR ECONOMY & MARKETPLACE ---
class ProductCreate(BaseModel):
    title: str
    description: str
    category: str
    material_type: str
    price: float
    quantity: int = 10
    production_method: str
    diy_level: str = "easy"
    image_url: Optional[str] = None
    environmental_saving_kg_co2: float = 2.5

class ProductOut(ProductCreate):
    id: int
    seller_id: int
    status: str
    created_at: datetime.datetime
    seller: Optional[UserOut] = None

    class Config:
        from_attributes = True

class MaterialExchangeListingCreate(BaseModel):
    title: str
    material_category: str
    weight_kg: float
    location_area: str
    price_per_kg: float = 0.0
    description: str

class MaterialExchangeListingOut(MaterialExchangeListingCreate):
    id: int
    lister_id: int
    status: str
    created_at: datetime.datetime
    lister: Optional[UserOut] = None

    class Config:
        from_attributes = True

class EnquiryCreate(BaseModel):
    product_id: Optional[int] = None
    recipient_id: int
    message: str
    contact_email: str

class EnquiryOut(EnquiryCreate):
    id: int
    sender_id: int
    status: str
    created_at: datetime.datetime
    sender: Optional[UserOut] = None

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    seller_id: int
    shipping_address: str
    items: List[OrderItemCreate]

class OrderOut(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    total_amount: float
    status: str
    shipping_address: str
    tracking_code: Optional[str] = None
    created_at: datetime.datetime
    buyer: Optional[UserOut] = None

    class Config:
        from_attributes = True

class ProductionCostCalculatorRequest(BaseModel):
    material_cost: float
    labor_hours: float
    labor_rate_per_hour: float
    packaging_cost: float
    overhead_cost: float = 0.0
    markup_percentage: float = 30.0

class ProductionCostCalculatorResponse(BaseModel):
    total_cost: float
    suggested_selling_price: float
    estimated_profit_per_unit: float
    profit_margin_pct: float

# --- COUNTRY PROFILES & ANALYTICS ---
class CountryProfileOut(BaseModel):
    id: int
    country_name: str
    country_code: str
    recycling_rate_pct: float
    primary_methods_json: Any
    case_study_title: str
    case_study_content: str
    limitations: str
    infrastructure: str
    reference_urls_json: Any
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class ForecastingRequest(BaseModel):
    historical_days: int = 30
    forecast_days: int = 14
    waste_category: Optional[str] = None
    area: Optional[str] = None

class ForecastPoint(BaseModel):
    date: str
    predicted_weight_kg: float
    lower_bound_kg: float
    upper_bound_kg: float

class ForecastingResponse(BaseModel):
    model_name: str
    validation_metrics: Dict[str, float]
    train_sample_size: int
    test_sample_size: int
    forecast: List[ForecastPoint]
    limitations: str

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    category: str
    is_read: bool
    action_link: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime.datetime

    class Config:
        from_attributes = True
