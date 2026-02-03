"""
BLUE BAY Fleet Management API Tests
Tests all backend endpoints for authentication, shops, vehicles, routes, tracking, warehouses, and analytics
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@bluebay.com"
ADMIN_PASSWORD = "admin123"
DRIVER_EMAIL = "driver@bluebay.com"
DRIVER_PASSWORD = "driver123"
SALESMAN_EMAIL = "salesman@bluebay.com"
SALESMAN_PASSWORD = "sales123"


class TestHealth:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")


class TestAuthentication:
    """Authentication endpoint tests for all 3 roles"""
    
    def test_admin_login(self):
        """Test admin login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful - role: {data['user']['role']}")
        return data["access_token"]
    
    def test_driver_login(self):
        """Test driver login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": DRIVER_EMAIL, "password": DRIVER_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == DRIVER_EMAIL
        assert data["user"]["role"] == "driver"
        print(f"✓ Driver login successful - role: {data['user']['role']}")
        return data["access_token"]
    
    def test_salesman_login(self):
        """Test salesman login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": SALESMAN_EMAIL, "password": SALESMAN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == SALESMAN_EMAIL
        assert data["user"]["role"] == "salesman"
        print(f"✓ Salesman login successful - role: {data['user']['role']}")
        return data["access_token"]
    
    def test_invalid_login(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": "invalid@test.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print("✓ Invalid login correctly returns 401")
    
    def test_get_current_user(self):
        """Test /api/auth/me endpoint returns current user"""
        # First login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_response.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        print(f"✓ Get current user successful - {data['name']}")


class TestShops:
    """Shop endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_shops(self):
        """Test getting all shops"""
        response = requests.get(
            f"{BASE_URL}/api/shops",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get shops successful - Total: {len(data)} shops")
        return data
    
    def test_get_shops_count_27(self):
        """Test that there are 27 shops as expected"""
        response = requests.get(
            f"{BASE_URL}/api/shops",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 27, f"Expected 27 shops, got {len(data)}"
        print(f"✓ Shop count verified: {len(data)} shops")
    
    def test_get_districts(self):
        """Test getting all districts"""
        response = requests.get(
            f"{BASE_URL}/api/shops/districts",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "districts" in data
        assert isinstance(data["districts"], list)
        print(f"✓ Get districts successful - {len(data['districts'])} districts")
    
    def test_get_shops_stats(self):
        """Test getting shop statistics"""
        response = requests.get(
            f"{BASE_URL}/api/shops/stats",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_shops" in data
        assert "by_district" in data
        print(f"✓ Get shops stats successful - Total: {data['total_shops']}")
    
    def test_search_shops(self):
        """Test searching shops"""
        response = requests.get(
            f"{BASE_URL}/api/shops",
            params={"search": "Kerala"},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Search shops successful - Found: {len(data)} shops")


class TestVehicles:
    """Vehicle endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_vehicles(self):
        """Test getting all vehicles"""
        response = requests.get(
            f"{BASE_URL}/api/vehicles",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get vehicles successful - Total: {len(data)} vehicles")
        return data
    
    def test_vehicles_count_3(self):
        """Test that there are 3 vehicles as expected"""
        response = requests.get(
            f"{BASE_URL}/api/vehicles",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3, f"Expected 3 vehicles, got {len(data)}"
        print(f"✓ Vehicle count verified: {len(data)} vehicles")
    
    def test_vehicles_have_registration(self):
        """Test that vehicles have registration numbers"""
        response = requests.get(
            f"{BASE_URL}/api/vehicles",
            headers=self.headers
        )
        data = response.json()
        for vehicle in data:
            assert "registration" in vehicle
            assert vehicle["registration"].startswith("KL-")
        print("✓ All vehicles have Kerala registration numbers")


class TestWarehouses:
    """Warehouse endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_warehouses(self):
        """Test getting all warehouses"""
        response = requests.get(
            f"{BASE_URL}/api/warehouses",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get warehouses successful - Total: {len(data)} warehouses")
        return data
    
    def test_warehouses_count_3(self):
        """Test that there are 3 warehouses as expected"""
        response = requests.get(
            f"{BASE_URL}/api/warehouses",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3, f"Expected 3 warehouses, got {len(data)}"
        print(f"✓ Warehouse count verified: {len(data)} warehouses")


class TestTracking:
    """GPS Tracking endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get first vehicle ID
        vehicles_response = requests.get(
            f"{BASE_URL}/api/vehicles",
            headers=self.headers
        )
        self.vehicles = vehicles_response.json()
    
    def test_get_vehicle_locations(self):
        """Test getting vehicle locations"""
        if not self.vehicles:
            pytest.skip("No vehicles available")
        
        vehicle_id = self.vehicles[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/tracking/vehicle/{vehicle_id}",
            params={"hours": 24},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get vehicle locations successful - {len(data)} locations")


class TestRoutes:
    """Route endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_routes(self):
        """Test getting all routes"""
        response = requests.get(
            f"{BASE_URL}/api/routes",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get routes successful - Total: {len(data)} routes")


class TestAnalytics:
    """Analytics endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_dashboard_analytics(self):
        """Test getting dashboard analytics"""
        response = requests.get(
            f"{BASE_URL}/api/analytics/dashboard",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify expected fields
        assert "total_shops" in data
        assert "total_vehicles" in data
        assert "total_warehouses" in data
        assert "active_vehicles" in data
        
        # Verify expected counts
        assert data["total_shops"] == 27, f"Expected 27 shops, got {data['total_shops']}"
        assert data["total_vehicles"] == 3, f"Expected 3 vehicles, got {data['total_vehicles']}"
        assert data["total_warehouses"] == 3, f"Expected 3 warehouses, got {data['total_warehouses']}"
        
        print(f"✓ Dashboard analytics verified:")
        print(f"  - Total Shops: {data['total_shops']}")
        print(f"  - Total Vehicles: {data['total_vehicles']}")
        print(f"  - Active Vehicles: {data['active_vehicles']}/{data['total_vehicles']}")
        print(f"  - Total Warehouses: {data['total_warehouses']}")


class TestSales:
    """Sales endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_sales(self):
        """Test getting all sales"""
        response = requests.get(
            f"{BASE_URL}/api/sales",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get sales successful - Total: {len(data)} sales")


class TestPWA:
    """PWA manifest and service worker tests"""
    
    def test_manifest_accessible(self):
        """Test that manifest.json is accessible"""
        response = requests.get(f"{BASE_URL}/manifest.json")
        assert response.status_code == 200
        data = response.json()
        
        # Verify manifest structure
        assert "name" in data
        assert "short_name" in data
        assert "icons" in data
        assert "start_url" in data
        assert "display" in data
        
        assert data["short_name"] == "BLUE BAY"
        assert data["display"] == "standalone"
        
        print(f"✓ PWA manifest valid:")
        print(f"  - Name: {data['name']}")
        print(f"  - Short Name: {data['short_name']}")
        print(f"  - Icons: {len(data['icons'])} icons defined")
    
    def test_service_worker_accessible(self):
        """Test that service-worker.js is accessible"""
        response = requests.get(f"{BASE_URL}/service-worker.js")
        assert response.status_code == 200
        content = response.text
        assert "CACHE_NAME" in content
        assert "bluebay-fleet" in content
        print("✓ Service worker accessible and contains expected content")


class TestNoGoogleMaps:
    """Verify Google Maps is NOT used in frontend"""
    
    def test_no_google_maps_in_frontend(self):
        """Test that Google Maps API is not loaded in frontend"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        content = response.text
        
        # Check that Google Maps script is NOT present
        assert "maps.googleapis.com" not in content, "Google Maps API found in frontend HTML"
        assert "google.maps" not in content.lower(), "Google Maps reference found in frontend"
        
        print("✓ No Google Maps API found in frontend HTML")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
