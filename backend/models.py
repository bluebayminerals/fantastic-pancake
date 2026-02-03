from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    SALESMAN = "salesman"
    DRIVER = "driver"

class UserBase(BaseModel):
    email: str
    name: str
    role: UserRole
    phone: str
    warehouse_id: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime
    is_active: bool = True

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class ShopBase(BaseModel):
    name: str
    address: str
    phone: str
    contact_person: str
    pincode: str
    latitude: float
    longitude: float
    delivery_time_minutes: int = 15

class ShopCreate(ShopBase):
    pass

class Shop(ShopBase):
    id: str
    created_at: datetime
    updated_at: datetime

class VehicleBase(BaseModel):
    registration: str
    capacity_kg: float
    driver_id: Optional[str] = None
    warehouse_id: str
    status: Literal["active", "inactive", "maintenance"] = "active"

class VehicleCreate(VehicleBase):
    pass

class Vehicle(VehicleBase):
    id: str
    current_location: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

class LocationUpdate(BaseModel):
    vehicle_id: str
    latitude: float
    longitude: float
    speed_kmh: float = 0
    bearing_degrees: float = 0
    accuracy_meters: int = 10

class RouteStop(BaseModel):
    shop_id: str
    sequence: int
    estimated_arrival: Optional[str] = None
    actual_arrival: Optional[str] = None
    status: Literal["pending", "completed", "skipped"] = "pending"

class RouteBase(BaseModel):
    vehicle_id: str
    driver_id: str
    date: str
    stops: List[RouteStop]
    estimated_distance_km: float = 0
    estimated_time_minutes: float = 0

class RouteCreate(RouteBase):
    pass

class Route(RouteBase):
    id: str
    status: Literal["pending", "in_progress", "completed"] = "pending"
    actual_distance_km: Optional[float] = None
    actual_time_minutes: Optional[float] = None
    created_at: datetime
    updated_at: datetime

class SaleItem(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    total_price: float

class SaleBase(BaseModel):
    shop_id: str
    salesman_id: str
    route_id: Optional[str] = None
    items: List[SaleItem]
    total_amount: float
    payment_mode: Literal["cash", "credit", "upi"] = "cash"
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: str
    sale_date: datetime
    created_at: datetime

class WarehouseBase(BaseModel):
    name: str
    location: str
    pincode: str
    manager_id: Optional[str] = None

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    id: str
    created_at: datetime

class InventoryItem(BaseModel):
    warehouse_id: str
    product_name: str
    quantity: int
    unit: str = "pcs"
    reorder_level: int = 10

class InventoryCreate(InventoryItem):
    pass

class Inventory(InventoryItem):
    id: str
    last_updated: datetime

class OptimizeRouteRequest(BaseModel):
    date: str
    shop_ids: List[str]
    vehicle_ids: List[str]
    warehouse_id: str