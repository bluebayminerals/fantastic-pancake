import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Seeding database...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.warehouses.delete_many({})
    await db.shops.delete_many({})
    await db.vehicles.delete_many({})
    
    # Create users
    users = [
        {
            "id": "admin1",
            "email": "admin@bluebay.com",
            "name": "Admin User",
            "role": "admin",
            "phone": "9876543210",
            "hashed_password": pwd_context.hash("admin123"),
            "warehouse_id": None,
            "created_at": datetime.now(timezone.utc),
            "is_active": True
        },
        {
            "id": "driver1",
            "email": "driver@bluebay.com",
            "name": "Driver One",
            "role": "driver",
            "phone": "9876543211",
            "hashed_password": pwd_context.hash("driver123"),
            "warehouse_id": "wh1",
            "created_at": datetime.now(timezone.utc),
            "is_active": True
        },
        {
            "id": "salesman1",
            "email": "salesman@bluebay.com",
            "name": "Salesman One",
            "role": "salesman",
            "phone": "9876543212",
            "hashed_password": pwd_context.hash("sales123"),
            "warehouse_id": "wh1",
            "created_at": datetime.now(timezone.utc),
            "is_active": True
        }
    ]
    
    await db.users.insert_many(users)
    print(f"Created {len(users)} users")
    
    # Create warehouses
    warehouses = [
        {
            "id": "wh1",
            "name": "Kochi Central Warehouse",
            "location": "Kochi, Kerala",
            "pincode": "682001",
            "manager_id": "admin1",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "wh2",
            "name": "Trivandrum Warehouse",
            "location": "Trivandrum, Kerala",
            "pincode": "695001",
            "manager_id": "admin1",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": "wh3",
            "name": "Calicut Warehouse",
            "location": "Calicut, Kerala",
            "pincode": "673001",
            "manager_id": "admin1",
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.warehouses.insert_many(warehouses)
    print(f"Created {len(warehouses)} warehouses")
    
    # Create shops
    shops = [
        {
            "id": "shop1",
            "name": "City Supermarket",
            "address": "MG Road, Kochi, Kerala",
            "phone": "9876501001",
            "contact_person": "Rajesh Kumar",
            "pincode": "682001",
            "latitude": 9.9312,
            "longitude": 76.2673,
            "delivery_time_minutes": 15,
            "location": {"type": "Point", "coordinates": [76.2673, 9.9312]},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": "shop2",
            "name": "Kerala Groceries",
            "address": "Fort Kochi, Kerala",
            "phone": "9876501002",
            "contact_person": "Priya Nair",
            "pincode": "682001",
            "latitude": 9.9650,
            "longitude": 76.2430,
            "delivery_time_minutes": 15,
            "location": {"type": "Point", "coordinates": [76.2430, 9.9650]},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": "shop3",
            "name": "Fresh Mart",
            "address": "Palarivattom, Kochi, Kerala",
            "phone": "9876501003",
            "contact_person": "Suresh Menon",
            "pincode": "682025",
            "latitude": 9.9957,
            "longitude": 76.3061,
            "delivery_time_minutes": 15,
            "location": {"type": "Point", "coordinates": [76.3061, 9.9957]},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": "shop4",
            "name": "Metro Stores",
            "address": "Edapally, Kochi, Kerala",
            "phone": "9876501004",
            "contact_person": "Anil Thomas",
            "pincode": "682024",
            "latitude": 10.0245,
            "longitude": 76.3089,
            "delivery_time_minutes": 15,
            "location": {"type": "Point", "coordinates": [76.3089, 10.0245]},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": "shop5",
            "name": "Quick Shop",
            "address": "Kakkanad, Kochi, Kerala",
            "phone": "9876501005",
            "contact_person": "Vinod Kumar",
            "pincode": "682030",
            "latitude": 10.0058,
            "longitude": 76.3522,
            "delivery_time_minutes": 15,
            "location": {"type": "Point", "coordinates": [76.3522, 10.0058]},
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.shops.insert_many(shops)
    print(f"Created {len(shops)} shops")
    
    # Create vehicles
    vehicles = [
        {
            "id": "vehicle1",
            "registration": "KL-07-AB-1234",
            "capacity_kg": 500,
            "driver_id": "driver1",
            "warehouse_id": "wh1",
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": "vehicle2",
            "registration": "KL-07-CD-5678",
            "capacity_kg": 750,
            "driver_id": None,
            "warehouse_id": "wh1",
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": "vehicle3",
            "registration": "KL-09-EF-9012",
            "capacity_kg": 600,
            "driver_id": None,
            "warehouse_id": "wh2",
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.vehicles.insert_many(vehicles)
    print(f"Created {len(vehicles)} vehicles")
    
    # Create indexes
    await db.shops.create_index([("location", "2dsphere")])
    await db.vehicles.create_index([("location", "2dsphere")])
    print("Created geospatial indexes")
    
    print("Database seeded successfully!")
    print("\nTest Credentials:")
    print("Admin: admin@bluebay.com / admin123")
    print("Driver: driver@bluebay.com / driver123")
    print("Salesman: salesman@bluebay.com / sales123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())