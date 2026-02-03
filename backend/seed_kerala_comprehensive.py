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

async def seed_comprehensive_kerala_data():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Seeding comprehensive Kerala business data...")
    
    # Clear existing shops
    await db.shops.delete_many({})
    
    # Comprehensive Kerala shops across all major districts
    kerala_shops = [
        # Thiruvananthapuram District
        {"id": "shop_tvpm_1", "name": "Capital Supermarket", "address": "MG Road, Thiruvananthapuram", "phone": "9876501001", "contact_person": "Rajesh Kumar", "pincode": "695001", "latitude": 8.5241, "longitude": 76.9366, "delivery_time_minutes": 15, "district": "Thiruvananthapuram", "location": {"type": "Point", "coordinates": [76.9366, 8.5241]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_tvpm_2", "name": "South Kerala Groceries", "address": "Kazhakootam, Thiruvananthapuram", "phone": "9876501002", "contact_person": "Priya Nair", "pincode": "695582", "latitude": 8.5710, "longitude": 76.8730, "delivery_time_minutes": 15, "district": "Thiruvananthapuram", "location": {"type": "Point", "coordinates": [76.8730, 8.5710]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_tvpm_3", "name": "Technopark Stores", "address": "Technopark Phase 1, Thiruvananthapuram", "phone": "9876501003", "contact_person": "Anil Thomas", "pincode": "695581", "latitude": 8.5497, "longitude": 76.8974, "delivery_time_minutes": 20, "district": "Thiruvananthapuram", "location": {"type": "Point", "coordinates": [76.8974, 8.5497]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Kollam District
        {"id": "shop_klm_1", "name": "Kollam Central Market", "address": "Main Road, Kollam", "phone": "9876502001", "contact_person": "Suresh Menon", "pincode": "691001", "latitude": 8.8932, "longitude": 76.6141, "delivery_time_minutes": 15, "district": "Kollam", "location": {"type": "Point", "coordinates": [76.6141, 8.8932]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_klm_2", "name": "Cashew City Stores", "address": "Chinnakada, Kollam", "phone": "9876502002", "contact_person": "Vinod Kumar", "pincode": "691001", "latitude": 8.8807, "longitude": 76.5840, "delivery_time_minutes": 15, "district": "Kollam", "location": {"type": "Point", "coordinates": [76.5840, 8.8807]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Kochi (Ernakulam) District
        {"id": "shop_kochi_1", "name": "City Supermarket", "address": "MG Road, Kochi", "phone": "9876503001", "contact_person": "Rajesh Kumar", "pincode": "682001", "latitude": 9.9312, "longitude": 76.2673, "delivery_time_minutes": 15, "district": "Ernakulam", "location": {"type": "Point", "coordinates": [76.2673, 9.9312]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_kochi_2", "name": "Kerala Groceries", "address": "Fort Kochi", "phone": "9876503002", "contact_person": "Priya Nair", "pincode": "682001", "latitude": 9.9650, "longitude": 76.2430, "delivery_time_minutes": 15, "district": "Ernakulam", "location": {"type": "Point", "coordinates": [76.2430, 9.9650]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_kochi_3", "name": "Fresh Mart", "address": "Palarivattom, Kochi", "phone": "9876503003", "contact_person": "Suresh Menon", "pincode": "682025", "latitude": 9.9957, "longitude": 76.3061, "delivery_time_minutes": 15, "district": "Ernakulam", "location": {"type": "Point", "coordinates": [76.3061, 9.9957]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_kochi_4", "name": "Metro Stores", "address": "Edapally, Kochi", "phone": "9876503004", "contact_person": "Anil Thomas", "pincode": "682024", "latitude": 10.0245, "longitude": 76.3089, "delivery_time_minutes": 15, "district": "Ernakulam", "location": {"type": "Point", "coordinates": [76.3089, 10.0245]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_kochi_5", "name": "Quick Shop", "address": "Kakkanad, Kochi", "phone": "9876503005", "contact_person": "Vinod Kumar", "pincode": "682030", "latitude": 10.0058, "longitude": 76.3522, "delivery_time_minutes": 15, "district": "Ernakulam", "location": {"type": "Point", "coordinates": [76.3522, 10.0058]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_kochi_6", "name": "Marine Drive Stores", "address": "Marine Drive, Kochi", "phone": "9876503006", "contact_person": "Deepa Krishnan", "pincode": "682031", "latitude": 9.9711, "longitude": 76.2847, "delivery_time_minutes": 10, "district": "Ernakulam", "location": {"type": "Point", "coordinates": [76.2847, 9.9711]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Thrissur District
        {"id": "shop_tcr_1", "name": "Thrissur Central Market", "address": "Round, Thrissur", "phone": "9876504001", "contact_person": "Manoj Kumar", "pincode": "680001", "latitude": 10.5276, "longitude": 76.2144, "delivery_time_minutes": 15, "district": "Thrissur", "location": {"type": "Point", "coordinates": [76.2144, 10.5276]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_tcr_2", "name": "Cultural City Stores", "address": "Swaraj Round, Thrissur", "phone": "9876504002", "contact_person": "Lakshmi Menon", "pincode": "680001", "latitude": 10.5200, "longitude": 76.2100, "delivery_time_minutes": 15, "district": "Thrissur", "location": {"type": "Point", "coordinates": [76.2100, 10.5200]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_tcr_3", "name": "Guruvayur Mart", "address": "East Nada, Guruvayur", "phone": "9876504003", "contact_person": "Ramesh Pillai", "pincode": "680101", "latitude": 10.5944, "longitude": 76.0392, "delivery_time_minutes": 20, "district": "Thrissur", "location": {"type": "Point", "coordinates": [76.0392, 10.5944]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Kozhikode (Calicut) District
        {"id": "shop_kkd_1", "name": "Calicut Beach Market", "address": "Beach Road, Kozhikode", "phone": "9876505001", "contact_person": "Shameer Ali", "pincode": "673001", "latitude": 11.2588, "longitude": 75.7804, "delivery_time_minutes": 15, "district": "Kozhikode", "location": {"type": "Point", "coordinates": [75.7804, 11.2588]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_kkd_2", "name": "Malabar Groceries", "address": "SM Street, Kozhikode", "phone": "9876505002", "contact_person": "Abdul Rasheed", "pincode": "673001", "latitude": 11.2480, "longitude": 75.7804, "delivery_time_minutes": 10, "district": "Kozhikode", "location": {"type": "Point", "coordinates": [75.7804, 11.2480]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_kkd_3", "name": "Cyberpark Stores", "address": "Cyberpark, Kozhikode", "phone": "9876505003", "contact_person": "Nisha Mohammed", "pincode": "673016", "latitude": 11.2650, "longitude": 75.8040, "delivery_time_minutes": 20, "district": "Kozhikode", "location": {"type": "Point", "coordinates": [75.8040, 11.2650]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Kannur District
        {"id": "shop_knr_1", "name": "Kannur City Market", "address": "Fort Road, Kannur", "phone": "9876506001", "contact_person": "Sudheer Kumar", "pincode": "670001", "latitude": 11.8745, "longitude": 75.3704, "delivery_time_minutes": 15, "district": "Kannur", "location": {"type": "Point", "coordinates": [75.3704, 11.8745]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_knr_2", "name": "Thalassery Spice Store", "address": "Thalassery Town, Kannur", "phone": "9876506002", "contact_person": "Mohammed Faizal", "pincode": "670101", "latitude": 11.7480, "longitude": 75.4900, "delivery_time_minutes": 20, "district": "Kannur", "location": {"type": "Point", "coordinates": [75.4900, 11.7480]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Kottayam District
        {"id": "shop_ktm_1", "name": "Kottayam Town Stores", "address": "KK Road, Kottayam", "phone": "9876507001", "contact_person": "George Mathew", "pincode": "686001", "latitude": 9.5916, "longitude": 76.5222, "delivery_time_minutes": 15, "district": "Kottayam", "location": {"type": "Point", "coordinates": [76.5222, 9.5916]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_ktm_2", "name": "Rubber City Market", "address": "MC Road, Kottayam", "phone": "9876507002", "contact_person": "Thomas Joseph", "pincode": "686001", "latitude": 9.5900, "longitude": 76.5200, "delivery_time_minutes": 15, "district": "Kottayam", "location": {"type": "Point", "coordinates": [76.5200, 9.5900]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Palakkad District  
        {"id": "shop_pkd_1", "name": "Palakkad Central Market", "address": "English Church Road, Palakkad", "phone": "9876508001", "contact_person": "Krishnan Nair", "pincode": "678001", "latitude": 10.7867, "longitude": 76.6548, "delivery_time_minutes": 15, "district": "Palakkad", "location": {"type": "Point", "coordinates": [76.6548, 10.7867]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_pkd_2", "name": "Gateway Stores", "address": "Head Post Office Road, Palakkad", "phone": "9876508002", "contact_person": "Radhakrishnan", "pincode": "678001", "latitude": 10.7790, "longitude": 76.6550, "delivery_time_minutes": 15, "district": "Palakkad", "location": {"type": "Point", "coordinates": [76.6550, 10.7790]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Alappuzha District
        {"id": "shop_alp_1", "name": "Backwater Market", "address": "Boat Jetty Road, Alappuzha", "phone": "9876509001", "contact_person": "Biju Kumar", "pincode": "688001", "latitude": 9.4981, "longitude": 76.3388, "delivery_time_minutes": 15, "district": "Alappuzha", "location": {"type": "Point", "coordinates": [76.3388, 9.4981]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_alp_2", "name": "Venice of East Stores", "address": "Mullackal, Alappuzha", "phone": "9876509002", "contact_person": "Shaji Thomas", "pincode": "688001", "latitude": 9.4900, "longitude": 76.3300, "delivery_time_minutes": 15, "district": "Alappuzha", "location": {"type": "Point", "coordinates": [76.3300, 9.4900]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        
        # Malappuram District
        {"id": "shop_mlp_1", "name": "Malappuram City Center", "address": "Mini Bypass, Malappuram", "phone": "9876510001", "contact_person": "Ashraf Ali", "pincode": "676505", "latitude": 11.0510, "longitude": 76.0711, "delivery_time_minutes": 15, "district": "Malappuram", "location": {"type": "Point", "coordinates": [76.0711, 11.0510]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
        {"id": "shop_mlp_2", "name": "Manjeri Market", "address": "Manjeri Town, Malappuram", "phone": "9876510002", "contact_person": "Karim Mohammed", "pincode": "676121", "latitude": 11.1209, "longitude": 76.1206, "delivery_time_minutes": 20, "district": "Malappuram", "location": {"type": "Point", "coordinates": [76.1206, 11.1209]}, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
    ]
    
    await db.shops.insert_many(kerala_shops)
    print(f"✓ Created {len(kerala_shops)} shops across Kerala districts")
    
    # Create indexes
    await db.shops.create_index([("location", "2dsphere")])
    await db.shops.create_index("district")
    await db.shops.create_index("pincode")
    print("✓ Created geospatial and search indexes")
    
    print(f"\n📊 District-wise Shop Distribution:")
    districts = {}
    for shop in kerala_shops:
        district = shop['district']
        districts[district] = districts.get(district, 0) + 1
    
    for district, count in sorted(districts.items()):
        print(f"  {district}: {count} shops")
    
    print(f"\n✅ Total geotagged businesses: {len(kerala_shops)}")
    print("✅ Comprehensive Kerala coverage complete!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_comprehensive_kerala_data())