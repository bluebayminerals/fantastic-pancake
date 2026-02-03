# BLUE BAY Fleet Management - Product Requirements Document

## Original Problem Statement
GPS-enabled route optimization application for "BLUE BAY," an FMCG distribution company in Kerala. The app assists drivers and salesmen who visit 100-150 shops daily across all pincodes in the state, operating from 6 different warehouses. Key features: recording daily sales, Excel import/export for address verification against pincodes.

## User Personas
- **Admin (Warehouse Managers):** Full access to route planning, fleet management, analytics, business directory
- **Drivers:** View assigned routes, GPS tracking, route completion
- **Salesmen:** Record daily sales, view shop details

## Core Requirements
1. Multi-role authentication (Admin, Driver, Salesman)
2. Interactive map with all geotagged stores across Kerala
3. Route planning and optimization
4. Live vehicle GPS tracking
5. Sales recording and reporting
6. Excel import/export for shop data
7. Dark theme professional UI
8. PWA support for mobile installation

## Technology Stack
- **Frontend:** React 19, Tailwind CSS, Shadcn/UI, Leaflet+OpenStreetMap
- **Backend:** FastAPI, Python 3
- **Database:** MongoDB with Motor async driver
- **Authentication:** JWT-based with role access control
- **Maps:** Leaflet.js with OpenStreetMap (migrated from Google Maps)

## Architecture
```
/app/
├── backend/
│   ├── services/        # Excel service, Google Maps geocoding
│   ├── auth.py          # JWT authentication
│   ├── models.py        # Pydantic models
│   └── server.py        # FastAPI routes
└── frontend/
    ├── public/
    │   ├── manifest.json    # PWA manifest
    │   ├── service-worker.js
    │   └── icons/           # PWA icons
    └── src/
        ├── pages/           # Route components
        └── components/ui/   # Shadcn components
```

## Database Schema
- **users:** { email, hashed_password, role, name }
- **warehouses:** { name, location (GeoJSON Point) }
- **shops:** { name, pincode, address, district, location (GeoJSON Point) }
- **vehicles:** { registration_number, driver_id, capacity_kg, status }
- **sales:** { shop_id, salesman_id, amount, payment_mode, timestamp }
- **routes:** { vehicle_id, driver_id, date, stops[], status }

## Key API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/shops` - List all shops with filtering
- `GET /api/shops/districts` - Get unique districts
- `GET /api/warehouses` - List all warehouses
- `POST /api/routes/optimize` - Generate optimized routes
- `GET /api/tracking/vehicle/{id}` - Get vehicle location history
- `POST /api/sales` - Record a sale
- `GET /api/analytics/dashboard` - Dashboard statistics

## Test Credentials
- **Admin:** admin@bluebay.com / admin123
- **Driver:** driver@bluebay.com / driver123
- **Salesman:** salesman@bluebay.com / sales123

---

## Implementation Status

### Completed Features (Feb 2025)
- [x] Multi-role authentication system
- [x] Admin Dashboard with fleet overview
- [x] Route Planning page with Leaflet map
- [x] Live Vehicle Tracking with Leaflet map
- [x] Business Directory (27 Kerala businesses)
- [x] Salesman Dashboard for sales recording
- [x] Driver Dashboard with route management
- [x] Analytics page with charts
- [x] Excel import/export functionality
- [x] Dark theme UI implementation
- [x] PWA support (manifest, service worker, icons)
- [x] Full Leaflet migration (removed Google Maps dependency)
- [x] Route polylines for delivery path visualization

### P0 - Critical (Resolved)
- [x] BusinessDirectoryPage babel plugin fix
- [x] LiveTrackingPage Google Maps to Leaflet migration
- [x] DriverDashboard Google Maps to Leaflet migration

### P1 - High Priority
- [ ] Real-time traffic data integration
- [ ] Push notifications for delivery updates
- [ ] Offline mode with data sync

### P2 - Medium Priority
- [ ] Customer delivery notifications
- [ ] Inventory management features
- [ ] Advanced analytics with predictive insights

### P3 - Future/Backlog
- [ ] Multi-language support (Malayalam, Hindi)
- [ ] Customer feedback mechanism
- [ ] Integration with accounting software
- [ ] Automated route suggestions based on historical data

---

## Known Issues
- ESLint warnings for useEffect dependencies (non-critical)

## Test Reports
- `/app/test_reports/iteration_4.json` - Latest comprehensive test (100% backend, 95% frontend)
