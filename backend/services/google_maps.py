import googlemaps
from typing import List, Dict
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

class GoogleMapsService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY not found in environment variables")
        self.gmaps = googlemaps.Client(key=api_key)
    
    def geocode_address(self, address: str, pincode: str) -> Dict:
        """Geocode an address and return coordinates"""
        try:
            geocode_result = self.gmaps.geocode(
                address=address,
                components={'postal_code': pincode, 'administrative_area': 'Kerala', 'country': 'IN'}
            )
            
            if not geocode_result:
                return {"valid": False, "error": "Address not found"}
            
            location = geocode_result[0]
            return {
                "valid": True,
                "formatted_address": location['formatted_address'],
                "latitude": location['geometry']['location']['lat'],
                "longitude": location['geometry']['location']['lng']
            }
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def calculate_distance_matrix(self, origins: List[tuple], destinations: List[tuple]) -> Dict:
        """Calculate distance and time between multiple points"""
        try:
            result = self.gmaps.distance_matrix(
                origins=origins,
                destinations=destinations,
                mode="driving",
                units="metric"
            )
            return result
        except Exception as e:
            return {"error": str(e)}
    
    def get_directions(self, origin: tuple, destination: tuple, waypoints: List[tuple] = None) -> Dict:
        """Get directions between points with optional waypoints"""
        try:
            result = self.gmaps.directions(
                origin=origin,
                destination=destination,
                waypoints=waypoints,
                mode="driving",
                optimize_waypoints=True
            )
            return result
        except Exception as e:
            return {"error": str(e)}

google_maps_service = GoogleMapsService()