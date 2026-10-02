# 🚚 TruckRoute ELD — Route Optimizer & Automated FMCSA Daily Log Generator

A professional full-stack logistics application built with **Django REST Framework** and **React (Vite + Tailwind CSS)** that takes commercial truck trip parameters, calculates optimal interstate routes using free mapping APIs, and automatically generates compliance-certified **FMCSA 24-Hour Driver's Daily Log Sheets** (49 CFR § 395.8) with continuous step graph lines.

---

## 🎯 Deliverables & Requirements Checklist

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Full-Stack App** | Django 5+ REST Framework Backend + React (Vite, Tailwind, Leaflet, SVG) | ✅ Complete |
| **Trip Inputs** | Current Location, Pickup Location, Dropoff Location, Current Cycle Used (Hrs) | ✅ Complete |
| **Free Map API** | OpenStreetMap tiles + Leaflet + OSRM Open Source Routing Machine (Zero API key needed) | ✅ Complete |
| **ELD Log Sheets** | Authentic FMCSA 24-Hour Daily Log Sheet matching DOT paper form with continuous grid line | ✅ Complete |
| **Multi-Day Trips** | Automatically slices long trips into sequential 24-hour log sheets (Day 1, Day 2, ..., Day N) | ✅ Complete |
| **Property-Carrying Rules** | 70hr/8day cycle, 11hr driving limit, 14hr duty window, 30m break, 10h sleeper reset | ✅ Complete |
| **Mandatory Fueling** | Fueling stop scheduled at least once every 1,000 miles (30m On-Duty Not Driving) | ✅ Complete |
| **Pickup & Drop-off** | 1.0 hour On-Duty Not Driving scheduled at both Pickup and Dropoff facilities | ✅ Complete |
| **Print / Export** | Dedicated print & PDF stylesheet for generating official paperwork | ✅ Complete |

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                       │
│  - TripForm (Inputs, Presets, Cycle Slider, Advanced BOL)   │
│  - TripSummary (KPI Cards: Miles, Drive/Duty/Rest Time)     │
│  - RouteMap (Leaflet OSM, Stop Markers, Route Polyline)     │
│  - ELDLogSheet (SVG 24-Hr Graph, Remarks, Shipping, Recap)  │
│  - StopsTimeline (Turn-by-Turn Schedule Table)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON API (/api/trips/plan/)
┌──────────────────────────────▼──────────────────────────────┐
│            Django REST Framework Backend                    │
│  - HOSPlannerEngine (49 CFR Part 395 Business Logic)        │
│  - Geocoding Service (OSM Nominatim + Offline US Cities)   │
│  - Routing Engine (OSRM Public API + Fallback Circuity)     │
│  - 24-Hr Daily Log Segmenter (Midnight-to-Midnight split)   │
│  - 70-Hr Recap Calculator (Lines 3 & 4, 7-Day & 8-Day Sum)  │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚖️ FMCSA Hours of Service (HOS) Engine Details

The simulation engine strictly enforces all Federal Motor Carrier Safety Administration (FMCSA) property-carrying driver regulations:
1. **70-Hour / 8-Day Rule**: Drivers may not drive after 70 hours on duty within any 8 consecutive days.
2. **11-Hour Driving Limit**: A driver may drive a maximum of 11 hours following 10 consecutive hours off duty.
3. **14-Hour Consecutive Duty Window**: Driving is prohibited beyond the 14th consecutive hour after coming on duty (on-duty time and breaks do not extend this window).
4. **30-Minute Rest Break**: Mandatory break required when driving reaches 8 cumulative hours without at least a 30-minute interruption.
5. **10 Consecutive Hours Off Duty / Sleeper Berth**: Resets both the 11-hour driving limit and 14-hour shift window.
6. **Mandatory Fueling (every $\le$ 1,000 miles)**: Fuel stops are automatically placed before reaching 1,000 miles (duration: 30 minutes On-Duty Not Driving).
7. **1 Hour for Pickup & 1 Hour for Drop-off**: Logged as On-Duty Not Driving at shipper and consignee locations.
8. **Daily Log Slicing (Midnight-to-Midnight)**: Every 24-hour day sheet contains status segments that mathematically sum to **exactly 24.00 hours** across:
   - Line 1: Off Duty
   - Line 2: Sleeper Berth
   - Line 3: Driving
   - Line 4: On Duty (Not Driving)

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Method 1: All-In-One Unified Server (Easiest)
Django is configured to serve both the REST API and the compiled React production frontend on a single port:

```bash
# 1. Activate Python virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 2. Build Frontend
cd frontend
npm install
npm run build
cd ..

# 3. Start Django Server
cd backend
python manage.py runserver
```

Now open **`http://127.0.0.1:8000`** in your browser! Both the API and React UI will run simultaneously.

---

### Method 2: Dual-Server Development (With Hot Reloading)

If you want live hot-reloading while editing frontend components:

**Terminal 1 (Django Backend):**
```bash
cd backend
python manage.py runserver
# Backend runs at http://127.0.0.1:8000
```

**Terminal 2 (React Vite Dev Server):**
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000 (proxies /api to Django)
```

---

## 🧪 Running Unit Tests

The backend includes a comprehensive automated test suite verifying HOS compliance, 24-hour line total balancing, 1,000-mile fueling intervals, multi-day log generation, and API endpoints:

```bash
cd backend
python manage.py test trips
```

Output:
```
Ran 8 tests in 6.459s
OK (System check identified no issues)
```

---

## 🌐 Live Cloud Deployment Guide

### Option 1: Frontend on Vercel + Backend on Render/Railway

1. **Deploy Backend to Render.com**:
   - Create a free account on [Render.com](https://render.com).
   - Click **New Web Service** &rarr; Connect your GitHub repository.
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt && python manage.py migrate`
   - Start Command: `gunicorn truck_eld_backend.wsgi:application --bind 0.0.0.0:$PORT`
   - Copy your public backend URL (e.g. `https://truck-eld-backend.onrender.com`).

2. **Deploy Frontend to Vercel**:
   - Create a free account on [Vercel](https://vercel.com).
   - Click **Add New Project** &rarr; Import your GitHub repository.
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Environment Variables:
     - `VITE_API_URL`: `https://truck-eld-backend.onrender.com`
   - Click **Deploy**!

---

## 📁 Repository Directory Structure

```
Truck Project/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── truck_eld_backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── trips/
│       ├── hos_engine.py      # Core FMCSA 70hr/8day HOS engine & log generator
│       ├── views.py           # REST API endpoints
│       ├── urls.py            # API routing
│       └── tests.py           # Automated unit test suite
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json            # Vercel deployment configuration
│   └── src/
│       ├── App.jsx            # Main app shell & state
│       ├── index.css          # Tailwind & print styles
│       ├── main.jsx           # React root
│       └── components/
│           ├── TripForm.jsx       # Inputs, cycle slider, BOL details
│           ├── TripSummary.jsx    # Metric KPI cards & compliance badges
│           ├── RouteMap.jsx       # Leaflet map with custom stop markers
│           ├── ELDLogSheet.jsx    # Authentic 24-hr FMCSA SVG log sheet
│           └── StopsTimeline.jsx  # Detailed itinerary table
├── render.yaml                # Render cloud deployment blueprint
├── .gitignore
└── README.md
```
