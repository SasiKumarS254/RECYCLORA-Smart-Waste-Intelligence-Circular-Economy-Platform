import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole:
    CITIZEN = "citizen"
    COLLECTOR = "collector"
    RECYCLER = "recycler"
    ADMINISTRATOR = "administrator"
    ANALYST = "analyst"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.CITIZEN, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    area = Column(String, nullable=True, default="Sector 4")
    avatar_url = Column(String, nullable=True)
    badge_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships with explicit foreign_keys specification
    waste_reports = relationship("WasteReport", foreign_keys="[WasteReport.reporter_id]", back_populates="reporter")
    pickup_requests = relationship("PickupRequest", foreign_keys="[PickupRequest.citizen_id]", back_populates="citizen")
    event_registrations = relationship("EventRegistration", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    products = relationship("Product", foreign_keys="[Product.seller_id]", back_populates="seller")
    orders = relationship("Order", foreign_keys="[Order.buyer_id]", back_populates="buyer")
    notifications = relationship("Notification", back_populates="user")

class WasteReport(Base):
    __tablename__ = "waste_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    address = Column(String, nullable=False)
    area = Column(String, nullable=False, default="Sector 4")
    latitude = Column(Float, default=28.6139)
    longitude = Column(Float, default=77.2090)
    urgency = Column(String, default="medium")
    status = Column(String, default="submitted")
    assigned_collector_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="waste_reports")
    collector = relationship("User", foreign_keys=[assigned_collector_id])
    status_history = relationship("ReportStatusHistory", back_populates="report", cascade="all, delete-orphan")

class ReportStatusHistory(Base):
    __tablename__ = "report_status_history"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("waste_reports.id"), nullable=False)
    status = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("WasteReport", back_populates="status_history")

class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    estimated_weight_kg = Column(Float, nullable=False)
    time_slot = Column(String, nullable=False)
    scheduled_date = Column(String, nullable=False)
    status = Column(String, default="requested")
    address = Column(String, nullable=False)
    area = Column(String, nullable=False, default="Sector 4")
    latitude = Column(Float, default=28.6139)
    longitude = Column(Float, default=77.2090)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="pickup_requests")
    assignment = relationship("CollectionAssignment", back_populates="pickup_request", uselist=False)

class CollectionAssignment(Base):
    __tablename__ = "collection_assignments"

    id = Column(Integer, primary_key=True, index=True)
    pickup_request_id = Column(Integer, ForeignKey("pickup_requests.id"), nullable=False)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_details = Column(String, default="EV Truck - WB02-9981")
    scheduled_time = Column(String, nullable=False)
    status = Column(String, default="assigned")
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    pickup_request = relationship("PickupRequest", back_populates="assignment")
    collector = relationship("User", foreign_keys=[collector_id])
    records = relationship("CollectionRecord", back_populates="assignment")

class CollectionRecord(Base):
    __tablename__ = "collection_records"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("collection_assignments.id"), nullable=True)
    pickup_request_id = Column(Integer, ForeignKey("pickup_requests.id"), nullable=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    actual_weight_kg = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    qr_code_verified = Column(Boolean, default=True)
    waste_report_id = Column(Integer, ForeignKey("waste_reports.id"), nullable=True)
    segregation_score = Column(Integer, default=95)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    assignment = relationship("CollectionAssignment", back_populates="records")
    collector = relationship("User", foreign_keys=[collector_id])

class WasteCategory(Base):
    __tablename__ = "waste_categories"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    recycling_rate_pct = Column(Float, default=70.0)
    sorting_guidelines = Column(Text, nullable=False)
    icon = Column(String, default="recycle")

class BinReading(Base):
    __tablename__ = "bin_readings"

    id = Column(Integer, primary_key=True, index=True)
    bin_code = Column(String, unique=True, index=True, nullable=False)
    location_name = Column(String, nullable=False)
    area = Column(String, nullable=False)
    capacity_liters = Column(Integer, default=240)
    current_fill_pct = Column(Float, default=45.0)
    battery_pct = Column(Float, default=92.0)
    status = Column(String, default="normal")
    latitude = Column(Float, default=28.6139)
    longitude = Column(Float, default=77.2090)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class DrainReport(Base):
    __tablename__ = "drain_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    area = Column(String, nullable=False)
    severity = Column(String, default="medium")
    status = Column(String, default="reported")
    image_url = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    assigned_to = Column(String, nullable=True)
    latitude = Column(Float, default=28.6139)
    longitude = Column(Float, default=77.2090)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id])

class CleanupEvent(Base):
    __tablename__ = "cleanup_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location_name = Column(String, nullable=False)
    area = Column(String, nullable=False)
    event_date = Column(String, nullable=False)
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    max_volunteers = Column(Integer, default=50)
    registered_count = Column(Integer, default=0)
    status = Column(String, default="upcoming")
    badge_earned = Column(String, default="Eco Warrior")
    latitude = Column(Float, default=28.6139)
    longitude = Column(Float, default=77.2090)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organizer = relationship("User", foreign_keys=[organizer_id])
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")

class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("cleanup_events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="registered")
    badge_awarded = Column(Boolean, default=False)
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("CleanupEvent", back_populates="registrations")
    user = relationship("User", back_populates="event_registrations")

class EducationalContent(Base):
    __tablename__ = "educational_content"

    id = Column(Integer, primary_key=True, index=True)
    module = Column(String, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    diy_steps_json = Column(JSON, nullable=True)
    quiz_questions_json = Column(JSON, nullable=True)
    icon = Column(String, default="book")
    estimated_read_time = Column(Integer, default=5)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    passed = Column(Boolean, default=True)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    reuse_options_json = Column(JSON, nullable=True)
    recycling_methods_json = Column(JSON, nullable=True)
    industrial_process = Column(Text, nullable=True)
    diy_guides_json = Column(JSON, nullable=True)
    environmental_impact_score = Column(Float, default=8.5)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    material_type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=10)
    production_method = Column(Text, nullable=False)
    diy_level = Column(String, default="easy")
    image_url = Column(String, nullable=True)
    status = Column(String, default="active")
    environmental_saving_kg_co2 = Column(Float, default=2.5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    seller = relationship("User", foreign_keys=[seller_id], back_populates="products")

class MaterialExchangeListing(Base):
    __tablename__ = "material_exchange_listings"

    id = Column(Integer, primary_key=True, index=True)
    lister_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    material_category = Column(String, nullable=False)
    weight_kg = Column(Float, nullable=False)
    location_area = Column(String, nullable=False)
    price_per_kg = Column(Float, default=0.0)
    status = Column(String, default="available")
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lister = relationship("User", foreign_keys=[lister_id])

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    contact_email = Column(String, nullable=False)
    status = Column(String, default="unread")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product")
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="pending")
    shipping_address = Column(Text, nullable=False)
    tracking_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="orders")
    seller = relationship("User", foreign_keys=[seller_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class CountryProfile(Base):
    __tablename__ = "country_profiles"

    id = Column(Integer, primary_key=True, index=True)
    country_name = Column(String, unique=True, index=True, nullable=False)
    country_code = Column(String, nullable=False)
    recycling_rate_pct = Column(Float, nullable=False)
    primary_methods_json = Column(JSON, nullable=False)
    case_study_title = Column(String, nullable=False)
    case_study_content = Column(Text, nullable=False)
    limitations = Column(Text, nullable=False)
    infrastructure = Column(Text, nullable=False)
    reference_urls_json = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    row_count = Column(Integer, default=0)
    column_mappings_json = Column(JSON, nullable=True)
    status = Column(String, default="processed")
    summary_json = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    uploader = relationship("User")

class AnalyticsJob(Base):
    __tablename__ = "analytics_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String, nullable=False)
    status = Column(String, default="completed")
    parameters_json = Column(JSON, nullable=True)
    metrics_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    finished_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String, default="info")
    is_read = Column(Boolean, default=False)
    action_link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
