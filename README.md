# RECYCLORA — Intelligent Waste Management & Circular Economy SaaS Platform

**Tagline**: Turn Waste Into Worth

RECYCLORA is a full-stack, cloud-ready SaaS application addressing urban waste management challenges in India through civic education, waste reporting, doorstep collection, smart bin monitoring, drainage blockage tracking, upcycled product manufacturing, a recycled-product marketplace, and Scikit-learn big data analytics.

---

## 🌟 Key Modules & Features

1. **CivicCare (Civic Education & Community Action)**
   - 5R Framework Learning Centre (Refuse, Reduce, Reuse, Repurpose, Recycle) with interactive quizzes and civic badges.
   - Waste Incident Reporting form with OpenStreetMap location pin, category, urgency, description, and status tracking (submitted, verified, assigned, in-progress, resolved).
   - Cleanup Event Calendar with volunteer registration and badge awards.
   - Area Cleanliness Indicators based on real application resolution records.

2. **WasteFlow (Smart Collection & Segregation)**
   - Doorstep collection requests with time slots and weight estimation.
   - Collector Portal with route maps, QR code verification simulation, and actual weight logging.
   - Source segregation guidelines for 9 waste categories.
   - Smart Bin capacity sensor monitoring with overflow alerts.
   - Drain Monitoring dashboard for urban flood prevention.

3. **CircuLab (Reuse, Recycling & Circular Economy)**
   - Waste-to-Product Explorer with step-by-step DIY upcycling guides.
   - Recycled & Upcycled Product Marketplace with search, filters, material specs, and demo checkout.
   - Material Exchange section for recyclers and artisans.
   - Production Cost & Profit Calculator for upcycled products.

4. **EarthScope (Global Waste Intelligence & Big Data Analytics)**
   - CSV Dataset Import Workflow with column mapping preview and validation.
   - Scikit-learn ML Waste Generation Forecasting with 80/20 chronological holdout validation metrics (MAE, RMSE, R²) and confidence bounds.
   - Automated Anomaly Detection for volume spikes and delay bottlenecks.
   - Global Waste Intelligence Hub for 6 countries (India, Japan, Germany, Sweden, South Korea, Singapore) with verified policy case studies and limitations.
   - Automated Analytics Report Generator for PDF and CSV downloads.

---

## 🔑 Development Seed Accounts (Ready for Testing)

| Role | Email | Password | Primary Dashboard Focus |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@recyclora.org` | `Citizen123!` | Waste Reporting, Pickups, Badges |
| **Collector** | `collector@recyclora.org` | `Collector123!` | Pickup Tasks, Route Map, QR Verification |
| **Recycler** | `recycler@recyclora.org` | `Recycler123!` | Marketplace Listings, Material Exchange, Profit Calculator |
| **Administrator** | `admin@recyclora.org` | `Admin123!` | User Roles, System Metrics, Moderation, Audit Logs |
| **Analyst** | `analyst@recyclora.org` | `Analyst123!` | CSV Dataset Upload, ML Forecasting, PDF/CSV Reports |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, Leaflet with OpenStreetMap, Lucide Icons.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, Pandas, NumPy, Scikit-learn, ReportLab (PDF Generator).
- **Database**: SQLite (Out-of-the-box local development), PostgreSQL 15 (Docker Compose & Production).
- **Security**: JWT Bearer Token Authentication, PBKDF2 Password Hashing, Role-Based Access Control (RBAC).
- **Containerization**: Docker, Docker Compose, Nginx.

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🧪 Testing Execution

### Backend Tests (Pytest)
```bash
cd backend
$env:PYTHONPATH="."
.\venv\Scripts\python.exe -m pytest
```

### Frontend Type Check & Production Build
```bash
cd frontend
npm run build
```

---

## 🐳 Docker Compose Local Stack

Run the full production-style environment (PostgreSQL + FastAPI Backend + React Nginx Frontend):

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL Database: `localhost:5432`

---

## 🌐 Cloud Deployment Architecture

1. **Database**: Managed PostgreSQL (AWS RDS / GCP Cloud SQL / DigitalOcean Postgres).
2. **Backend**: AWS App Runner, GCP Cloud Run, or Docker EC2 instance behind an Application Load Balancer.
3. **Frontend**: Static Hosting via AWS S3 + CloudFront CDN, Vercel, or Netlify.
4. **Environment Variables**:
   - `DATABASE_URL`: `postgresql://user:pass@host:5432/recyclora_db`
   - `SECRET_KEY`: High-entropy production JWT secret key.
   - `ENV`: `production`

---

## 📜 License
Open Source under MIT License.
