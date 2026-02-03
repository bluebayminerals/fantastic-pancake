from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from bson import ObjectId
from models import (
    UserCreate, User, UserRole, Token,
    ShopCreate, Shop, VehicleCreate, Vehicle,
    RouteCreate, Route, RouteStop,
    SaleCreate, Sale, WarehouseCreate, Warehouse,
    InventoryCreate, Inventory, LocationUpdate,
    OptimizeRouteRequest
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_role
)
from services.google_maps import google_maps_service
from services.excel_service import excel_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create indexes
async def create_indexes():
    await db.shops.create_index([("location", "2dsphere")])
    await db.vehicles.create_index([("location", "2dsphere")])
    await db.locations.create_index([("vehicle_id", 1), ("timestamp", -1)])
    await db.users.create_index("email", unique=True)

app = FastAPI(title="BLUE BAY Fleet Management")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============ AUTHENTICATION ============

@app.post("/api/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    del user_dict["password"]
    user_dict["created_at"] = datetime.now(timezone.utc)
    user_dict["is_active"] = True
    
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    del user_dict["_id"]
    del user_dict["hashed_password"]
    
    return User(**user_dict)

@app.post("/api/auth/login", response_model=Token)
async def login(email: str, password: str):
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"]
    })
    
    user["id"] = str(user["_id"])
    del user["_id"]
    del user["hashed_password"]
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=User(**user)
    )

@app.get("/api/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])}, {"_id": 0, "hashed_password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = current_user["sub"]
    return User(**user)

# ============ SHOPS ============

@app.post("/api/shops", response_model=Shop)
async def create_shop(
    shop_data: ShopCreate,
    current_user: dict = Depends(require_role(["admin"]))
):
    # Validate address with Google Maps
    validation = google_maps_service.geocode_address(shop_data.address, shop_data.pincode)
    
    if not validation.get("valid"):
        raise HTTPException(status_code=400, detail=f"Invalid address: {validation.get('error')}")
    
    shop_dict = shop_data.model_dump()
    shop_dict.update({
        "latitude": validation["latitude"],
        "longitude": validation["longitude"],
        "formatted_address": validation["formatted_address"],
        "location": {
            "type": "Point",
            "coordinates": [validation["longitude"], validation["latitude"]]
        },
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })
    
    result = await db.shops.insert_one(shop_dict)
    shop_dict["id"] = str(result.inserted_id)
    del shop_dict["_id"]
    
    return Shop(**shop_dict)

@app.get("/api/shops", response_model=List[Shop])
async def get_shops(
    district: Optional[str] = None,
    pincode: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if district:
        query["district"] = district
    if pincode:
        query["pincode"] = pincode
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}},
            {"contact_person": {"$regex": search, "$options": "i"}}
        ]
    
    shops = await db.shops.find(query, {"_id": 0}).to_list(1000)
    for shop in shops:
        if "location" in shop:
            del shop["location"]
    return shops

@app.get("/api/shops/districts")
async def get_districts(current_user: dict = Depends(get_current_user)):
    districts = await db.shops.distinct("district")
    return {"districts": sorted(districts)}

@app.get("/api/shops/stats")
async def get_shops_stats(current_user: dict = Depends(get_current_user)):
    total_shops = await db.shops.count_documents({})
    
    # Group by district
    pipeline = [
        {"$group": {"_id": "$district", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    district_stats = await db.shops.aggregate(pipeline).to_list(100)
    
    return {
        "total_shops": total_shops,
        "by_district": [{"district": stat["_id"], "count": stat["count"]} for stat in district_stats]
    }

@app.get("/api/shops/{shop_id}", response_model=Shop)
async def get_shop(shop_id: str, current_user: dict = Depends(get_current_user)):
    shop = await db.shops.find_one({"id": shop_id}, {"_id": 0})
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    if "location" in shop:
        del shop["location"]
    return Shop(**shop)

# ============ VEHICLES ============

@app.post("/api/vehicles", response_model=Vehicle)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    current_user: dict = Depends(require_role(["admin"]))
):
    vehicle_dict = vehicle_data.model_dump()
    vehicle_dict.update({
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    })
    
    result = await db.vehicles.insert_one(vehicle_dict)
    vehicle_dict["id"] = str(result.inserted_id)
    del vehicle_dict["_id"]
    
    return Vehicle(**vehicle_dict)

@app.get("/api/vehicles", response_model=List[Vehicle])
async def get_vehicles(current_user: dict = Depends(get_current_user)):
    vehicles = await db.vehicles.find({}, {"_id": 0}).to_list(1000)
    return vehicles

@app.put("/api/vehicles/{vehicle_id}/assign-driver")
async def assign_driver(
    vehicle_id: str,
    driver_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    await db.vehicles.update_one(
        {"id": vehicle_id},
        {"$set": {"driver_id": driver_id, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Driver assigned successfully"}

# ============ ROUTES ============

@app.post("/api/routes/optimize")
async def optimize_routes(
    request: OptimizeRouteRequest,
    current_user: dict = Depends(require_role(["admin"]))
):
    # Get warehouse location
    warehouse = await db.warehouses.find_one({"id": request.warehouse_id}, {"_id": 0})
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    # Get shops
    shops = await db.shops.find({"id": {"$in": request.shop_ids}}, {"_id": 0}).to_list(1000)
    
    if len(shops) == 0:
        raise HTTPException(status_code=400, detail="No shops found")
    
    # Simple optimization: distribute shops among vehicles
    shops_per_vehicle = len(shops) // len(request.vehicle_ids)
    routes_created = []
    
    for idx, vehicle_id in enumerate(request.vehicle_ids):
        start_idx = idx * shops_per_vehicle
        end_idx = start_idx + shops_per_vehicle if idx < len(request.vehicle_ids) - 1 else len(shops)
        vehicle_shops = shops[start_idx:end_idx]
        
        # Get vehicle and driver
        vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
        if not vehicle or not vehicle.get("driver_id"):
            continue
        
        # Create route stops
        stops = []
        for seq, shop in enumerate(vehicle_shops, 1):
            stops.append({
                "shop_id": shop["id"],
                "sequence": seq,
                "status": "pending"
            })
        
        # Calculate estimated distance using Google Maps
        if len(vehicle_shops) > 0:
            waypoints = [(shop["latitude"], shop["longitude"]) for shop in vehicle_shops]
            
        route_dict = {
            "id": str(ObjectId()),
            "vehicle_id": vehicle_id,
            "driver_id": vehicle["driver_id"],
            "date": request.date,
            "stops": stops,
            "estimated_distance_km": len(vehicle_shops) * 5,  # Rough estimate
            "estimated_time_minutes": len(vehicle_shops) * 30,
            "status": "pending",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.routes.insert_one(route_dict)
        routes_created.append(route_dict["id"])
    
    return {
        "message": "Routes optimized successfully",
        "route_ids": routes_created,
        "total_routes": len(routes_created)
    }

@app.get("/api/routes", response_model=List[Route])
async def get_routes(
    date: Optional[str] = None,
    driver_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if date:
        query["date"] = date
    if driver_id:
        query["driver_id"] = driver_id
    
    routes = await db.routes.find(query, {"_id": 0}).to_list(1000)
    return routes

@app.put("/api/routes/{route_id}/status")
async def update_route_status(
    route_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    await db.routes.update_one(
        {"id": route_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Route status updated"}

# ============ GPS TRACKING ============

@app.post("/api/tracking/location")
async def update_location(
    location: LocationUpdate,
    current_user: dict = Depends(get_current_user)
):
    location_dict = location.model_dump()
    location_dict.update({
        "location": {
            "type": "Point",
            "coordinates": [location.longitude, location.latitude]
        },
        "timestamp": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    })
    
    await db.locations.insert_one(location_dict)
    
    # Update vehicle current location
    await db.vehicles.update_one(
        {"id": location.vehicle_id},
        {"$set": {
            "current_location": location_dict["location"],
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"message": "Location updated successfully"}

@app.get("/api/tracking/vehicle/{vehicle_id}")
async def get_vehicle_locations(
    vehicle_id: str,
    hours: int = 1,
    current_user: dict = Depends(get_current_user)
):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    locations = await db.locations.find(
        {"vehicle_id": vehicle_id, "timestamp": {"$gte": since}},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    
    return locations

# ============ SALES ============

@app.post("/api/sales", response_model=Sale)
async def create_sale(
    sale_data: SaleCreate,
    current_user: dict = Depends(get_current_user)
):
    sale_dict = sale_data.model_dump()
    sale_dict.update({
        "id": str(ObjectId()),
        "sale_date": datetime.now(timezone.utc),
        "created_at": datetime.now(timezone.utc)
    })
    
    await db.sales.insert_one(sale_dict)
    
    return Sale(**sale_dict)

@app.get("/api/sales")
async def get_sales(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    salesman_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if salesman_id:
        query["salesman_id"] = salesman_id
    if start_date and end_date:
        query["sale_date"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }
    
    sales = await db.sales.find(query, {"_id": 0}).to_list(1000)
    return sales

# ============ WAREHOUSES ============

@app.post("/api/warehouses", response_model=Warehouse)
async def create_warehouse(
    warehouse_data: WarehouseCreate,
    current_user: dict = Depends(require_role(["admin"]))
):
    warehouse_dict = warehouse_data.model_dump()
    warehouse_dict.update({
        "id": str(ObjectId()),
        "created_at": datetime.now(timezone.utc)
    })
    
    await db.warehouses.insert_one(warehouse_dict)
    
    return Warehouse(**warehouse_dict)

@app.get("/api/warehouses", response_model=List[Warehouse])
async def get_warehouses(current_user: dict = Depends(get_current_user)):
    warehouses = await db.warehouses.find({}, {"_id": 0}).to_list(100)
    return warehouses

# ============ INVENTORY ============

@app.post("/api/inventory", response_model=Inventory)
async def create_inventory(
    inventory_data: InventoryCreate,
    current_user: dict = Depends(require_role(["admin"]))
):
    inventory_dict = inventory_data.model_dump()
    inventory_dict.update({
        "id": str(ObjectId()),
        "last_updated": datetime.now(timezone.utc)
    })
    
    await db.inventory.insert_one(inventory_dict)
    
    return Inventory(**inventory_dict)

@app.get("/api/inventory")
async def get_inventory(
    warehouse_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if warehouse_id:
        query["warehouse_id"] = warehouse_id
    
    inventory = await db.inventory.find(query, {"_id": 0}).to_list(1000)
    return inventory

# ============ EXCEL IMPORT/EXPORT ============

@app.get("/api/excel/shops-template")
async def download_shops_template(current_user: dict = Depends(require_role(["admin"]))):
    output = excel_service.generate_shops_template()
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=shops_template.xlsx"}
    )

@app.post("/api/excel/shops-import")
async def import_shops(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role(["admin"]))
):
    content = await file.read()
    shops_data = excel_service.parse_shops_excel(content)
    
    created_count = 0
    for shop_data in shops_data:
        # Validate and create shop
        validation = google_maps_service.geocode_address(shop_data["address"], shop_data["pincode"])
        
        if validation.get("valid"):
            shop_data.update({
                "id": str(ObjectId()),
                "latitude": validation["latitude"],
                "longitude": validation["longitude"],
                "formatted_address": validation["formatted_address"],
                "location": {
                    "type": "Point",
                    "coordinates": [validation["longitude"], validation["latitude"]]
                },
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
            
            await db.shops.insert_one(shop_data)
            created_count += 1
    
    return {"message": f"{created_count} shops imported successfully", "total": created_count}

@app.get("/api/excel/sales-report")
async def download_sales_report(
    start_date: str,
    end_date: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    sales = await db.sales.find({
        "sale_date": {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }
    }, {"_id": 0}).to_list(10000)
    
    # Bulk fetch shops and users to avoid N+1 queries
    shop_ids = list(set(sale["shop_id"] for sale in sales if sale.get("shop_id")))
    user_ids = list(set(sale["salesman_id"] for sale in sales if sale.get("salesman_id")))
    
    shops_list = await db.shops.find({"id": {"$in": shop_ids}}, {"_id": 0}).to_list(len(shop_ids)) if shop_ids else []
    users_list = await db.users.find({"id": {"$in": user_ids}}, {"_id": 0}).to_list(len(user_ids)) if user_ids else []
    
    shops_map = {shop["id"]: shop for shop in shops_list}
    users_map = {user["id"]: user for user in users_list}
    
    # Enrich with shop and salesman names using lookup maps
    for sale in sales:
        shop = shops_map.get(sale.get("shop_id"))
        user = users_map.get(sale.get("salesman_id"))
        sale["shop_name"] = shop["name"] if shop else "Unknown"
        sale["salesman_name"] = user["name"] if user else "Unknown"
    
    output = excel_service.generate_sales_report(sales)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=sales_report_{start_date}_to_{end_date}.xlsx"}
    )

# ============ ANALYTICS ============

@app.get("/api/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    # Get counts
    total_shops = await db.shops.count_documents({})
    total_vehicles = await db.vehicles.count_documents({})
    total_warehouses = await db.warehouses.count_documents({})
    
    # Today's routes
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_routes = await db.routes.count_documents({"date": today})
    
    # Today's sales
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
    today_sales = await db.sales.find({
        "sale_date": {"$gte": today_start}
    }, {"_id": 0}).to_list(1000)
    
    total_sales_today = sum(sale["total_amount"] for sale in today_sales)
    
    # Active vehicles
    active_vehicles = await db.vehicles.count_documents({"status": "active"})
    
    return {
        "total_shops": total_shops,
        "total_vehicles": total_vehicles,
        "total_warehouses": total_warehouses,
        "active_vehicles": active_vehicles,
        "today_routes": today_routes,
        "today_sales_count": len(today_sales),
        "today_sales_amount": total_sales_today
    }

@app.on_event("startup")
async def startup():
    await create_indexes()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown():
    client.close()
    logger.info("Application shutdown")

@app.get("/api/health")
async def health():
    return {"status": "healthy"}