from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Material, Product, MaterialExchangeListing, Enquiry, Order, OrderItem, User, Notification
)
from app.schemas import (
    ProductCreate, ProductOut, MaterialExchangeListingCreate, MaterialExchangeListingOut,
    EnquiryCreate, EnquiryOut, OrderCreate, OrderOut,
    ProductionCostCalculatorRequest, ProductionCostCalculatorResponse
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/circular", tags=["CircuLab"])

# --- MATERIALS & DIY GUIDES ---
@router.get("/materials")
def get_materials(db: Session = Depends(get_db)):
    return db.query(Material).all()

# --- MARKETPLACE PRODUCTS ---
@router.get("/products", response_model=List[ProductOut])
def get_products(
    category_filter: Optional[str] = None,
    material_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.status == "active")
    if category_filter:
        query = query.filter(Product.category == category_filter)
    if material_filter:
        query = query.filter(Product.material_type == material_filter)
    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))
    return query.order_by(Product.created_at.desc()).all()

@router.post("/products", response_model=ProductOut)
def create_product(
    prod_in: ProductCreate,
    current_user: User = Depends(require_role(["recycler", "administrator"])),
    db: Session = Depends(get_db)
):
    product = Product(
        seller_id=current_user.id,
        title=prod_in.title,
        description=prod_in.description,
        category=prod_in.category,
        material_type=prod_in.material_type,
        price=prod_in.price,
        quantity=prod_in.quantity,
        production_method=prod_in.production_method,
        diy_level=prod_in.diy_level,
        image_url=prod_in.image_url or "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
        environmental_saving_kg_co2=prod_in.environmental_saving_kg_co2,
        status="active"
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

# --- MATERIAL EXCHANGE LISTINGS ---
@router.get("/material-exchange", response_model=List[MaterialExchangeListingOut])
def get_material_exchange_listings(db: Session = Depends(get_db)):
    return db.query(MaterialExchangeListing).filter(MaterialExchangeListing.status == "available").order_by(MaterialExchangeListing.created_at.desc()).all()

@router.post("/material-exchange", response_model=MaterialExchangeListingOut)
def create_material_exchange_listing(
    list_in: MaterialExchangeListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = MaterialExchangeListing(
        lister_id=current_user.id,
        title=list_in.title,
        material_category=list_in.material_category,
        weight_kg=list_in.weight_kg,
        location_area=list_in.location_area,
        price_per_kg=list_in.price_per_kg,
        description=list_in.description,
        status="available"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

# --- ENQUIRIES & DEMO ORDERS ---
@router.post("/enquiries", response_model=EnquiryOut)
def create_enquiry(
    enquiry_in: EnquiryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enquiry = Enquiry(
        product_id=enquiry_in.product_id,
        sender_id=current_user.id,
        recipient_id=enquiry_in.recipient_id,
        message=enquiry_in.message,
        contact_email=enquiry_in.contact_email,
        status="unread"
    )
    db.add(enquiry)

    # In-app notification to seller
    notif = Notification(
        user_id=enquiry_in.recipient_id,
        title="New Marketplace Enquiry",
        message=f"Received message from {current_user.full_name}: '{enquiry_in.message[:50]}...'",
        category="marketplace",
        action_link="/circulab"
    )
    db.add(notif)
    db.commit()
    db.refresh(enquiry)
    return enquiry

@router.post("/orders", response_model=OrderOut)
def place_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_amount = 0.0
    order_items_to_create = []

    for item in order_in.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")
        
        item_total = prod.price * item.quantity
        total_amount += item_total
        order_items_to_create.append(OrderItem(product_id=prod.id, quantity=item.quantity, unit_price=prod.price))

    order = Order(
        buyer_id=current_user.id,
        seller_id=order_in.seller_id,
        total_amount=round(total_amount, 2),
        status="confirmed",
        shipping_address=order_in.shipping_address,
        tracking_code=f"RECY-TRACK-{current_user.id}-982"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for oi in order_items_to_create:
        oi.order_id = order.id
        db.add(oi)

    # Notifications
    notif_buyer = Notification(
        user_id=current_user.id,
        title="Demo Order Placed Successfully!",
        message=f"Order #{order.id} for ₹{order.total_amount:,.2f} confirmed.",
        category="marketplace",
        action_link="/circulab"
    )
    notif_seller = Notification(
        user_id=order_in.seller_id,
        title="New Order Received!",
        message=f"You have a new order #{order.id} worth ₹{order.total_amount:,.2f}.",
        category="marketplace",
        action_link="/circulab"
    )
    db.add(notif_buyer)
    db.add(notif_seller)
    db.commit()
    db.refresh(order)
    return order

# --- PRODUCTION COST CALCULATOR ---
@router.post("/cost-calculator", response_model=ProductionCostCalculatorResponse)
def calculate_production_cost(calc_in: ProductionCostCalculatorRequest):
    labor_cost = calc_in.labor_hours * calc_in.labor_rate_per_hour
    total_cost = calc_in.material_cost + labor_cost + calc_in.packaging_cost + calc_in.overhead_cost
    suggested_price = total_cost * (1.0 + (calc_in.markup_percentage / 100.0))
    profit = suggested_price - total_cost
    margin_pct = (profit / suggested_price * 100.0) if suggested_price > 0 else 0.0

    return ProductionCostCalculatorResponse(
        total_cost=round(total_cost, 2),
        suggested_selling_price=round(suggested_price, 2),
        estimated_profit_per_unit=round(profit, 2),
        profit_margin_pct=round(margin_pct, 1)
    )
