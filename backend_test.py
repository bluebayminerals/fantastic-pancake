import requests
import sys
from datetime import datetime
import json

class BlueBayAPITester:
    def __init__(self, base_url="https://deliverymap-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.driver_token = None
        self.salesman_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_login(self, email, password, role_name):
        """Test login and get token"""
        success, response = self.run_test(
            f"Login ({role_name})",
            "POST",
            f"api/auth/login?email={email}&password={password}",
            200
        )
        if success and 'access_token' in response:
            return response['access_token']
        return None

    def test_get_me(self, token, role_name):
        """Test get current user"""
        success, response = self.run_test(
            f"Get Current User ({role_name})",
            "GET",
            "api/auth/me",
            200,
            token=token
        )
        return success

    def test_get_shops(self, token):
        """Test get shops"""
        success, response = self.run_test(
            "Get Shops",
            "GET",
            "api/shops",
            200,
            token=token
        )
        return success, response

    def test_get_vehicles(self, token):
        """Test get vehicles"""
        success, response = self.run_test(
            "Get Vehicles",
            "GET",
            "api/vehicles",
            200,
            token=token
        )
        return success, response

    def test_get_warehouses(self, token):
        """Test get warehouses"""
        success, response = self.run_test(
            "Get Warehouses",
            "GET",
            "api/warehouses",
            200,
            token=token
        )
        return success, response

    def test_get_routes(self, token):
        """Test get routes"""
        success, response = self.run_test(
            "Get Routes",
            "GET",
            "api/routes",
            200,
            token=token
        )
        return success, response

    def test_dashboard_analytics(self, token):
        """Test dashboard analytics"""
        success, response = self.run_test(
            "Dashboard Analytics",
            "GET",
            "api/analytics/dashboard",
            200,
            token=token
        )
        return success, response

    def test_optimize_routes(self, token, shop_ids, vehicle_ids, warehouse_id):
        """Test route optimization"""
        success, response = self.run_test(
            "Optimize Routes",
            "POST",
            "api/routes/optimize",
            200,
            data={
                "date": datetime.now().strftime("%Y-%m-%d"),
                "shop_ids": shop_ids,
                "vehicle_ids": vehicle_ids,
                "warehouse_id": warehouse_id
            },
            token=token
        )
        return success, response

    def test_create_sale(self, token, shop_id, salesman_id):
        """Test creating a sale"""
        success, response = self.run_test(
            "Create Sale",
            "POST",
            "api/sales",
            200,
            data={
                "shop_id": shop_id,
                "salesman_id": salesman_id,
                "items": [
                    {
                        "product_name": "Test Product",
                        "quantity": 2,
                        "unit_price": 100.0,
                        "total_price": 200.0
                    }
                ],
                "total_amount": 200.0,
                "payment_mode": "cash",
                "notes": "Test sale"
            },
            token=token
        )
        return success, response

    def test_get_sales(self, token, salesman_id=None):
        """Test get sales"""
        endpoint = "api/sales"
        if salesman_id:
            endpoint += f"?salesman_id={salesman_id}"
        
        success, response = self.run_test(
            "Get Sales",
            "GET",
            endpoint,
            200,
            token=token
        )
        return success, response

    def test_vehicle_location_tracking(self, token, vehicle_id):
        """Test vehicle location tracking"""
        # First update location
        success, response = self.run_test(
            "Update Vehicle Location",
            "POST",
            "api/tracking/location",
            200,
            data={
                "vehicle_id": vehicle_id,
                "latitude": 9.9312,
                "longitude": 76.2673,
                "speed_kmh": 45.5
            },
            token=token
        )
        
        if success:
            # Then get location history
            success2, response2 = self.run_test(
                "Get Vehicle Locations",
                "GET",
                f"api/tracking/vehicle/{vehicle_id}?hours=1",
                200,
                token=token
            )
            return success2, response2
        
        return success, response

def main():
    print("🚀 Starting Blue Bay Fleet Management API Tests")
    print("=" * 60)
    
    tester = BlueBayAPITester()
    
    # Test health check first
    health_success, _ = tester.test_health_check()
    if not health_success:
        print("❌ Health check failed, stopping tests")
        return 1

    # Test authentication for all roles
    print("\n📋 Testing Authentication...")
    admin_token = tester.test_login("admin@bluebay.com", "admin123", "Admin")
    driver_token = tester.test_login("driver@bluebay.com", "driver123", "Driver")
    salesman_token = tester.test_login("salesman@bluebay.com", "sales123", "Salesman")

    if not admin_token:
        print("❌ Admin login failed, stopping tests")
        return 1

    # Test get current user for all roles
    if admin_token:
        tester.test_get_me(admin_token, "Admin")
    if driver_token:
        tester.test_get_me(driver_token, "Driver")
    if salesman_token:
        tester.test_get_me(salesman_token, "Salesman")

    # Test core endpoints with admin token
    print("\n📋 Testing Core Endpoints...")
    shops_success, shops_data = tester.test_get_shops(admin_token)
    vehicles_success, vehicles_data = tester.test_get_vehicles(admin_token)
    warehouses_success, warehouses_data = tester.test_get_warehouses(admin_token)
    routes_success, routes_data = tester.test_get_routes(admin_token)
    
    # Test analytics
    analytics_success, analytics_data = tester.test_dashboard_analytics(admin_token)

    # Test route optimization if we have data
    if shops_success and vehicles_success and warehouses_success:
        if (shops_data and len(shops_data) > 0 and 
            vehicles_data and len(vehicles_data) > 0 and 
            warehouses_data and len(warehouses_data) > 0):
            
            shop_ids = [shop['id'] for shop in shops_data[:2]]  # Take first 2 shops
            vehicle_ids = [vehicle['id'] for vehicle in vehicles_data[:1]]  # Take first vehicle
            warehouse_id = warehouses_data[0]['id']  # Take first warehouse
            
            tester.test_optimize_routes(admin_token, shop_ids, vehicle_ids, warehouse_id)

    # Test sales functionality with salesman token
    print("\n📋 Testing Sales Functionality...")
    if salesman_token and shops_success and shops_data:
        # Get salesman user info first
        salesman_success, salesman_response = tester.run_test(
            "Get Salesman Info",
            "GET", 
            "api/auth/me",
            200,
            token=salesman_token
        )
        
        if salesman_success and shops_data:
            salesman_id = salesman_response.get('id')
            shop_id = shops_data[0]['id'] if shops_data else None
            
            if salesman_id and shop_id:
                # Test creating a sale
                sale_success, sale_response = tester.test_create_sale(salesman_token, shop_id, salesman_id)
                
                # Test getting sales
                tester.test_get_sales(salesman_token, salesman_id)

    # Test vehicle tracking functionality
    print("\n📋 Testing Vehicle Tracking...")
    if admin_token and vehicles_success and vehicles_data:
        if vehicles_data:
            vehicle_id = vehicles_data[0]['id']
            tester.test_vehicle_location_tracking(admin_token, vehicle_id)

    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failed in tester.failed_tests:
            if 'error' in failed:
                print(f"  - {failed.get('test', 'Unknown')}: {failed['error']}")
            else:
                print(f"  - {failed.get('test', 'Unknown')}: Expected {failed.get('expected')}, got {failed.get('actual')}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())