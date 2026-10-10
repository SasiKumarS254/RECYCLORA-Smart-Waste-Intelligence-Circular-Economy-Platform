import datetime
from sqlalchemy.orm import Session
from app.models import (
    User, UserRole, WasteCategory, EducationalContent, BinReading, DrainReport,
    CleanupEvent, WasteReport, ReportStatusHistory, PickupRequest, CollectionAssignment,
    CollectionRecord, Product, MaterialExchangeListing, CountryProfile, Notification, Material
)
from app.auth import hash_password

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).filter(User.email == "admin@recyclora.org").first():
        return

    print("Seeding RECYCLORA database with initial accounts & data...")

    # 1. Seed 5 Role Accounts
    users = [
        User(
            email="citizen@recyclora.org",
            hashed_password=hash_password("Citizen123!"),
            full_name="Aarav Sharma",
            role=UserRole.CITIZEN,
            phone="+91 98765 43210",
            address="42 Green Park Extension, New Delhi",
            area="Sector 4",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
            badge_count=3
        ),
        User(
            email="collector@recyclora.org",
            hashed_password=hash_password("Collector123!"),
            full_name="Rajesh Kumar",
            role=UserRole.COLLECTOR,
            phone="+91 98123 45678",
            address="15 Depot Road, Central Zone",
            area="Sector 4",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
            badge_count=5
        ),
        User(
            email="recycler@recyclora.org",
            hashed_password=hash_password("Recycler123!"),
            full_name="Priya Patel (EcoCraft Innovations)",
            role=UserRole.RECYCLER,
            phone="+91 97890 12345",
            address="Industrial Estate Hub 8, Gurgaon",
            area="Industrial Zone B",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
            badge_count=8
        ),
        User(
            email="admin@recyclora.org",
            hashed_password=hash_password("Admin123!"),
            full_name="Dr. Vikram Sen",
            role=UserRole.ADMINISTRATOR,
            phone="+91 99999 88888",
            address="Civic Headquarters, New Delhi",
            area="Central Admin",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
            badge_count=12
        ),
        User(
            email="analyst@recyclora.org",
            hashed_password=hash_password("Analyst123!"),
            full_name="Ananya Verma",
            role=UserRole.ANALYST,
            phone="+91 98888 77777",
            address="Circular Economy Analytics Lab",
            area="Analytics Hub",
            avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80",
            badge_count=6
        ),
    ]
    for u in users:
        db.add(u)
    db.commit()

    citizen_user = db.query(User).filter(User.email == "citizen@recyclora.org").first()
    collector_user = db.query(User).filter(User.email == "collector@recyclora.org").first()
    recycler_user = db.query(User).filter(User.email == "recycler@recyclora.org").first()
    admin_user = db.query(User).filter(User.email == "admin@recyclora.org").first()

    # 2. Seed Waste Categories
    categories = [
        WasteCategory(code="organic", name="Organic & Wet Waste", description="Food scraps, kitchen waste, garden trimmings, bio-degradable matter", recycling_rate_pct=85.0, sorting_guidelines="Keep wet waste separate in green bins. Do not mix plastic or foil wrappers."),
        WasteCategory(code="paper", name="Paper & Cardboard", description="Newspapers, corrugated boxes, office paper, magazines", recycling_rate_pct=75.0, sorting_guidelines="Keep dry and flat. Remove plastic tapes and metal clips."),
        WasteCategory(code="plastic", name="Plastics (PET, HDPE, PP)", description="Bottles, containers, packaging films, jug containers", recycling_rate_pct=65.0, sorting_guidelines="Rinse residual liquid. Flatten bottles to save volume."),
        WasteCategory(code="glass", name="Glass Containers", description="Beverage bottles, glass jars, food containers", recycling_rate_pct=80.0, sorting_guidelines="Separate by clear, green, and brown glass. Handle with care."),
        WasteCategory(code="metal", name="Metals & Cans", description="Aluminum cans, tin foil, steel scrap, wire offcuts", recycling_rate_pct=90.0, sorting_guidelines="Rinse out liquid food scraps. Crush aluminum cans."),
        WasteCategory(code="e-waste", name="E-Waste & Electronics", description="Circuit boards, cables, old phones, batteries, small appliances", recycling_rate_pct=45.0, sorting_guidelines="Never put in regular bins. Handle battery terminals with care."),
        WasteCategory(code="textile", name="Textiles & Fabrics", description="Unusable fabric trimmings, worn clothing, curtains, rags", recycling_rate_pct=60.0, sorting_guidelines="Keep dry. Separate clean wearable clothes for reuse."),
        WasteCategory(code="construction", name="C&D Waste (Construction & Demolition)", description="Bricks, mortar, ceramic tiles, concrete rubble", recycling_rate_pct=50.0, sorting_guidelines="Store in heavy-duty sacks. Keep separate from domestic waste."),
        WasteCategory(code="hazardous", name="Domestic Hazardous Waste", description="Paints, solvents, expired medicines, pesticides, fluorescent bulbs", recycling_rate_pct=30.0, sorting_guidelines="Keep in original sealed containers. Label explicitly.")
    ]
    for c in categories:
        db.add(c)

    # 3. Seed Materials
    materials = [
        Material(
            code="PET-01",
            name="Polyethylene Terephthalate (PET)",
            category="Plastic",
            reuse_options_json=["Planter pots", "Storage organizers", "Drip irrigation bottles"],
            recycling_methods_json=["Mechanical shredding", "Pelletization", "R-PET Fiber spinning for polyester jackets"],
            industrial_process="Baled PET bottles are washed, shredded into flakes, optical-sorted by color, melted at 260°C and extruded into rPET pellets for synthetic textile yarn.",
            diy_guides_json=[{"title": "Self-Watering Hanging Planter", "difficulty": "Easy", "tools": ["Scissors", "Cotton String", "Potting Soil"], "cost": 25}],
            environmental_impact_score=9.2
        ),
        Material(
            code="CARD-02",
            name="Corrugated Cardboard",
            category="Paper",
            reuse_options_json=["Storage boxes", "Cat scratch pads", "Drawer dividers"],
            recycling_methods_json=["Pulping with warm water", "De-inking", "Pressing into linerboard"],
            industrial_process="Cardboard waste is repulped in water, screened to remove tape, de-inked, and pressed into recycled corrugated medium.",
            diy_guides_json=[{"title": "Desk Storage Organizer", "difficulty": "Easy", "tools": ["Craft Knife", "Ruler", "Glue"], "cost": 15}],
            environmental_impact_score=8.8
        )
    ]
    for m in materials:
        db.add(m)

    # 4. Seed Educational Content (5R Framework)
    modules = [
        EducationalContent(
            module="refuse",
            title="Refuse — Say No to Single-Use Waste",
            summary="The most effective way to eliminate waste is to prevent it at the source by refusing non-essential single-use items.",
            content="Refusing single-use plastics, excessive packaging, and promotional flyers is the first line of defense in the 5R Framework. By choosing durable reusable bags, stainless steel bottles, and refusal of disposable cutlery, you instantly prevent waste generation.",
            diy_steps_json=["Carry a foldable canvas tote bag everywhere.", "Politely request 'No plastic cutlery' when ordering food takeaway.", "Switch to refilling water bottles at public hydration stations."],
            quiz_questions_json=[
                {"question": "What is the primary objective of the 'Refuse' principle?", "options": ["Burn all waste", "Prevent waste at source by turning down single-use items", "Bury waste underground", "Recycle everything"], "answer": 1},
                {"question": "Which of these is a direct example of 'Refuse'?", "options": ["Buying single-use plastic water bottles daily", "Carrying a reusable stainless steel water bottle", "Throwing paper in the river", "Melting plastic at home"], "answer": 1}
            ],
            estimated_read_time=4
        ),
        EducationalContent(
            module="reduce",
            title="Reduce — Minimize Resource Consumption",
            summary="Lowering consumption rates preserves raw natural materials and cuts municipal waste stream volume.",
            content="Reducing means consuming less and choosing products with minimal ecological footprints. Buying bulk grains, opting for digital receipts, and choosing energy-efficient appliances directly reduces carbon emissions and waste load.",
            diy_steps_json=["Conduct a 3-day home waste audit.", "Choose package-free fresh produce at local markets.", "Digitize billing and paper receipts."],
            quiz_questions_json=[
                {"question": "How does 'Reduce' differ from 'Recycle'?", "options": ["Reduce avoids creating waste in the first place", "Reduce costs millions of dollars", "They are identical terms", "Reduce is only for industrial factories"], "answer": 0}
            ],
            estimated_read_time=5
        ),
        EducationalContent(
            module="reuse",
            title="Reuse — Extending Product Lifecycle",
            summary="Pass items on to secondary users or use items repeatedly before discarding.",
            content="Reusing items in their original form without re-manufacturing saves energy and raw resources. Glass jars become food storage, canvas bags replace plastic bags, and worn clothing is repurposed into cleaning rags.",
            diy_steps_json=["Clean glass pickle jars for spice storage.", "Donate outgrown clothes to community thrift drives.", "Refill ink cartridges instead of buying new ones."],
            quiz_questions_json=[
                {"question": "Which household item can easily be reused as food storage?", "options": ["Disposable paper napkin", "Clean glass glass jar with lid", "Styrofoam cup", "Plastic wrap"], "answer": 1}
            ],
            estimated_read_time=4
        ),
        EducationalContent(
            module="repurpose",
            title="Repurpose — Creative Upcycling & Upcrafted Products",
            summary="Transform discarded materials into new products of higher artistic or functional value.",
            content="Repurposing (Upcycling) breathes new life into items destined for landfills. Old wooden pallets become outdoor garden furniture, wine corks become bulletin boards, and plastic bottles become self-watering planters.",
            diy_steps_json=["Cut plastic bottles to make desk pen stands.", "Convert old denim jeans into heavy-duty tote bags.", "Paint tin cans to create decorative herb planters."],
            quiz_questions_json=[
                {"question": "What is another term commonly used for Repurposing?", "options": ["Incineration", "Upcycling", "Landfilling", "Composting"], "answer": 1}
            ],
            estimated_read_time=6
        ),
        EducationalContent(
            module="recycle",
            title="Recycle — Closing the Industrial Resource Loop",
            summary="Processing discarded materials to manufacture raw feedstock for new goods.",
            content="Recycling breaks down waste into raw materials to manufacture new products. Proper source segregation into organic, paper, plastic, metal, and glass is essential for effective industrial recycling.",
            diy_steps_json=["Separate household waste into wet and dry bins.", "Clean food residues from plastic containers before disposal.", "Drop off e-waste at authorized recycling collection centers."],
            quiz_questions_json=[
                {"question": "Why is rinsing food containers important before recycling?", "options": ["It makes them heavier", "It prevents contamination of dry paper and plastic recyclables", "It changes their color", "It melts the plastic"], "answer": 1}
            ],
            estimated_read_time=5
        )
    ]
    for m in modules:
        db.add(m)

    # 5. Seed Smart Bins (Simulated Readings)
    bins = [
        BinReading(bin_code="BIN-DEL-101", location_name="Connaught Place Outer Ring", area="Sector 4", capacity_liters=240, current_fill_pct=88.5, battery_pct=94.0, status="warning", latitude=28.6315, longitude=77.2197),
        BinReading(bin_code="BIN-DEL-102", location_name="Khan Market Taxi Stand", area="Sector 4", capacity_liters=240, current_fill_pct=96.0, battery_pct=88.0, status="overflow", latitude=28.6002, longitude=77.2270),
        BinReading(bin_code="BIN-DEL-103", location_name="Nehru Place Metro Gate 2", area="Sector 7", capacity_liters=360, current_fill_pct=42.0, battery_pct=98.0, status="normal", latitude=28.5494, longitude=77.2518),
        BinReading(bin_code="BIN-DEL-104", location_name="Cyber City Hub South", area="Industrial Zone B", capacity_liters=360, current_fill_pct=72.0, battery_pct=85.0, status="normal", latitude=28.4950, longitude=77.0895),
        BinReading(bin_code="BIN-DEL-105", location_name="Dwarka Sector 10 Market", area="West Zone", capacity_liters=240, current_fill_pct=94.0, battery_pct=91.0, status="overflow", latitude=28.5810, longitude=77.0580)
    ]
    for b in bins:
        db.add(b)

    # 6. Seed Drain Reports
    drains = [
        DrainReport(
            reporter_id=citizen_user.id,
            title="Main Storm Drain Blocked by Plastic Bottles",
            location_name="Block C Lane 4, Green Park Extension",
            area="Sector 4",
            severity="high",
            status="inspecting",
            image_url="https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=600&q=80",
            description="Accumulation of plastic bags and debris blocking stormwater inflow. Risk of localized street flooding during monsoon.",
            assigned_to="Drain Maintenance Squad 2",
            latitude=28.5588,
            longitude=77.2028
        ),
        DrainReport(
            reporter_id=citizen_user.id,
            title="Culvert Silt Overflow near Metro Pillar 114",
            location_name="Lajpat Nagar Ring Road",
            area="South Central",
            severity="medium",
            status="cleared",
            image_url="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
            description="Desilting completed on Oct 2, 2026. Waterflow fully restored.",
            assigned_to="Municipal Works Team A",
            latitude=28.5677,
            longitude=77.2433
        )
    ]
    for d in drains:
        db.add(d)

    # 7. Seed Cleanup Events
    events = [
        CleanupEvent(
            title="Yamuna Riverbank Restoration Drive",
            description="Join municipal leaders and eco-volunteers in removing floating plastic waste and planting native wetland vegetation along the riverbank.",
            location_name="Kudasia Ghat, Old Delhi",
            area="North Central",
            event_date="2026-10-18",
            organizer_id=admin_user.id,
            max_volunteers=100,
            registered_count=38,
            status="upcoming",
            badge_earned="River Guardian",
            latitude=28.6650,
            longitude=77.2320
        ),
        CleanupEvent(
            title="Sector 4 Zero-Waste Residential Cleanliness Drive",
            description="Community collection of segregated dry recyclables and e-waste drop-off.",
            location_name="Community Center Park, Sector 4",
            area="Sector 4",
            event_date="2026-10-25",
            organizer_id=admin_user.id,
            max_volunteers=50,
            registered_count=22,
            status="upcoming",
            badge_earned="Eco Warrior",
            latitude=28.6139,
            longitude=77.2090
        )
    ]
    for e in events:
        db.add(e)

    # 8. Seed Waste Reports
    report1 = WasteReport(
        reporter_id=citizen_user.id,
        category="overflowing bin",
        description="Public smart bin overflowing onto sidewalk. Plastic bottles scattered around base.",
        image_url="https://images.unsplash.com/photo-1526958072389-58a5bf994421?auto=format&fit=crop&w=600&q=80",
        address="Near Gate 3, Sector 4 Market",
        area="Sector 4",
        latitude=28.6139,
        longitude=77.2090,
        urgency="high",
        status="in_progress",
        assigned_collector_id=collector_user.id
    )
    db.add(report1)
    db.commit()

    hist1 = ReportStatusHistory(report_id=report1.id, status="submitted", notes="Report submitted by citizen", updated_by_id=citizen_user.id)
    hist2 = ReportStatusHistory(report_id=report1.id, status="assigned", notes="Assigned to Rajesh Kumar (Collector)", updated_by_id=admin_user.id)
    db.add(hist1)
    db.add(hist2)

    # 9. Seed Pickup Requests & Assignments
    pickup1 = PickupRequest(
        citizen_id=citizen_user.id,
        category="paper",
        estimated_weight_kg=18.5,
        time_slot="Morning (8-11 AM)",
        scheduled_date="2026-10-12",
        status="scheduled",
        address="42 Green Park Extension, New Delhi",
        area="Sector 4",
        notes="Old newspapers and corrugated packing boxes stacked in garage."
    )
    db.add(pickup1)
    db.commit()

    assign1 = CollectionAssignment(
        pickup_request_id=pickup1.id,
        collector_id=collector_user.id,
        vehicle_details="EV Truck - WB02-9981",
        scheduled_time="09:30 AM",
        status="assigned"
    )
    db.add(assign1)

    rec1 = CollectionRecord(
        pickup_request_id=pickup1.id,
        collector_id=collector_user.id,
        actual_weight_kg=22.4,
        category="paper",
        qr_code_verified=True,
        waste_report_id=report1.id,
        segregation_score=98,
        notes="High quality clean paper waste collected and verified."
    )
    db.add(rec1)

    # 10. Seed Products in Marketplace
    products = [
        Product(
            seller_id=recycler_user.id,
            title="Upcycled Denim Carry Tote Bag",
            description="Handcrafted from 100% reclaimed post-consumer denim jeans. Features reinforced stitching, inner phone pocket, and organic cotton lining.",
            category="Fashion & Accessories",
            material_type="Textile",
            price=450.0,
            quantity=15,
            production_method="Post-consumer denim fabric washed, cut into patterns, and sewn by artisan women co-ops.",
            diy_level="intermediate",
            image_url="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
            status="active",
            environmental_saving_kg_co2=3.8
        ),
        Product(
            seller_id=recycler_user.id,
            title="Recycled PET Fiber Self-Watering Planter",
            description="Sleek geometric planter made from 100% recycled PET plastic bottles. Includes passive sub-irrigation wick system.",
            category="Home & Garden",
            material_type="Plastic",
            price=290.0,
            quantity=25,
            production_method="Shredded post-consumer PET bottles injection-molded into UV-stabilized planter pots.",
            diy_level="easy",
            image_url="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80",
            status="active",
            environmental_saving_kg_co2=1.9
        ),
        Product(
            seller_id=recycler_user.id,
            title="Reclaimed Teak Wood Desk Organizer",
            description="Hand-milled desk caddy crafted from discarded construction scaffolding teak wood. Sealed with natural beeswax.",
            category="Stationery",
            material_type="Wood",
            price=680.0,
            quantity=8,
            production_method="Salvaged timber de-nailed, planed, sanded, and finished with organic oil.",
            diy_level="intermediate",
            image_url="https://images.unsplash.com/photo-1585336261026-875a66228b06?auto=format&fit=crop&w=600&q=80",
            status="active",
            environmental_saving_kg_co2=4.2
        )
    ]
    for p in products:
        db.add(p)

    # 11. Seed Material Exchange Listings
    listings = [
        MaterialExchangeListing(
            lister_id=recycler_user.id,
            title="Balais of Clean Shredded HDPE Flakes (White/Natural)",
            material_category="Plastic",
            weight_kg=450.0,
            location_area="Industrial Zone B",
            price_per_kg=32.0,
            status="available",
            description="Washed, hot-water rinsed HDPE flakes from milk jugs. Melt flow rate 0.7 g/10min."
        ),
        MaterialExchangeListing(
            lister_id=recycler_user.id,
            title="Clean Corrugated Cardboard Trimmings",
            material_category="Paper",
            weight_kg=800.0,
            location_area="Sector 4",
            price_per_kg=12.0,
            status="available",
            description="Baled industrial cardboard offcuts ready for repulping mills."
        )
    ]
    for l in listings:
        db.add(l)

    # 12. Seed Country Profiles for 6 Countries
    countries = [
        CountryProfile(
            country_name="India",
            country_code="IN",
            recycling_rate_pct=30.0,
            primary_methods_json=["Informal Kabadiwala Network", "Swachh Bharat Urban Mission", "Extended Producer Responsibility (EPR)", "Dry Waste Collection Centers (DWCC)"],
            case_study_title="Indore Municipal Corporation — 6-Bin Source Segregation Model",
            case_study_content="Indore transformed from rank 149 to India's cleanest city by enforcing strict 6-bin source segregation at doorstep collection (wet, dry, hazardous, sanitary, plastic, e-waste) with 100% GPS tracked collection vehicles.",
            limitations="High reliance on informal sector integration, patchy sanitary waste infrastructure, and regional enforcement disparities.",
            infrastructure="100% door-to-door collection in 4,000+ ULBs; 60,000+ compost plants & bio-methanation centers.",
            reference_urls_json=["https://sbmurban.org/", "https://cpcb.nic.in/epr-portal/"]
        ),
        CountryProfile(
            country_name="Japan",
            country_code="JP",
            recycling_rate_pct=84.0,
            primary_methods_json=["Kamikatsu 45-Category Waste Sorting", "Thermal Recycling (Incineration with Energy Recovery)", "Containers and Packaging Recycling Law"],
            case_study_title="Kamikatsu Town — Target Zero Waste Campaign",
            case_study_content="The rural town of Kamikatsu achieves over 80% recycling rate without municipal garbage trucks by requiring residents to bring waste to a central station sorted into 45 distinct categories.",
            limitations="High percentage of 'thermal recycling' (incineration), which reduces landfill volume but emits combustion CO2.",
            infrastructure="Advanced high-efficiency waste-to-energy plants and community collection stations.",
            reference_urls_json=["https://www.env.go.jp/en/", "https://zwtk.or.jp/"]
        ),
        CountryProfile(
            country_name="Germany",
            country_code="DE",
            recycling_rate_pct=67.0,
            primary_methods_json=["Pfandsystem (Bottle Deposit Return)", "Dual System / Gelber Sack (Yellow Bag)", "Circular Economy Act (Kreislaufwirtschaftsgesetz)"],
            case_study_title="Pfand Reverse Vending System",
            case_study_content="Germany's Pfand system charges a €0.25 deposit on PET bottles and cans, achieving a 98% return rate through automated reverse vending machines in supermarkets.",
            limitations="Complex multi-layered compliance reporting for small manufacturers and high consumer packaging volume.",
            infrastructure="Nationwide automated reverse vending machines, optical sorting plants, and organic bio-waste digestion.",
            reference_urls_json=["https://www.bmuv.de/en/", "https://www.dwr.de/"]
        ),
        CountryProfile(
            country_name="Sweden",
            country_code="SE",
            recycling_rate_pct=99.0,
            primary_methods_json=["Waste-to-Energy (Avfall Sverige)", "District Heating Integration", "Optical Household Bag Sorting"],
            case_study_title="Importing Waste for District Heating Fuel",
            case_study_content="Sweden diverts 99% of household waste from landfills. Waste-to-energy plants generate heating for 1 million homes and electricity for 250,000 homes, requiring waste imports from nearby nations.",
            limitations="Creates lock-in demand for combustible waste feedstocks to keep district heating boilers operational.",
            infrastructure="34 Waste-to-Energy power plants integrated into municipal district heating grids.",
            reference_urls_json=["https://www.avfallsverige.se/en/"]
        ),
        CountryProfile(
            country_name="South Korea",
            country_code="KR",
            recycling_rate_pct=60.0,
            primary_methods_json=["Jongnyangje Volume-Based Waste Fee System", "RFID Smart Food Waste Bins", "Mandatory Organic Waste Landfill Ban"],
            case_study_title="RFID Smart Food Waste Bin System in Seoul",
            case_study_content="Residents pay for food waste by weight using RFID keycards at smart neighborhood collection bins. Food waste recycled into animal feed and fertilizer reached 95%.",
            limitations="Odors around collection points and high maintenance requirements for automated electronic bin scales.",
            infrastructure="Pay-as-you-throw RFID smart bins in apartment complexes across Seoul.",
            reference_urls_json=["https://eng.me.go.kr/"]
        ),
        CountryProfile(
            country_name="Singapore",
            country_code="SG",
            recycling_rate_pct=52.0,
            primary_methods_json=["Zero Waste Masterplan", "Semakau Offshore Landfill", "Tuas Nexus Integrated Waste & Water Facility"],
            case_study_title="Tuas Nexus Integrated Resource Recovery Facility",
            case_study_content="Singapore co-locates waste incineration with water reclamation to turn food waste and sludge into biogas energy, maximizing land productivity on an island state.",
            limitations="Single offshore landfill (Semakau) expected to reach capacity by 2035 if generation is not drastically reduced.",
            infrastructure="4 waste-to-energy plants and Semakau offshore ash disposal facility.",
            reference_urls_json=["https://www.nea.gov.sg/"]
        )
    ]
    for cp in countries:
        db.add(cp)

    # 13. Seed Notifications
    notifs = [
        Notification(
            user_id=citizen_user.id,
            title="Pickup Scheduled",
            message="Your paper waste pickup has been assigned to Rajesh Kumar for Oct 12 at 09:30 AM.",
            category="collection",
            is_read=False,
            action_link="/wasteflow"
        ),
        Notification(
            user_id=citizen_user.id,
            title="Cleanup Event Badge Earned",
            message="Congratulations! You earned the 'River Guardian' badge candidate status.",
            category="event",
            is_read=True,
            action_link="/civiccare"
        )
    ]
    for n in notifs:
        db.add(n)

    db.commit()
    print("Database seeding completed successfully!")
