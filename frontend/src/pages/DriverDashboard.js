import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../AuthContext';
import { getRoutes, updateRouteStatus, getShops, updateLocation } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const KERALA_CENTER = [10.8505, 76.2711];

// Custom marker icons
const createShopIcon = () => {
  return L.divIcon({
    className: 'shop-marker',
    html: `<div style="width:24px;height:24px;background:#10B981;border:2px solid white;border-radius:50%;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const createCurrentLocationIcon = () => {
  return L.divIcon({
    className: 'current-location-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to update map center
const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.latitude, center.longitude], 14);
    }
  }, [center, map]);
  return null;
};

export const DriverDashboard = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [shops, setShops] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
    startLocationTracking();
  }, []);

  const fetchRoutes = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await getRoutes({ date: today, driver_id: user.id });
      setRoutes(response.data);
      
      const active = response.data.find(r => r.status === 'in_progress');
      if (active) {
        setActiveRoute(active);
        await fetchShopsForRoute(active);
      }
    } catch (error) {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopsForRoute = async (route) => {
    try {
      const shopIds = route.stops.map(s => s.shop_id);
      const shopsData = await Promise.all(shopIds.map(id => getShops()));
      setShops(shopsData[0].data);
    } catch (error) {
      console.error('Failed to load shops');
    }
  };

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed_kmh: (position.coords.speed || 0) * 3.6,
            bearing_degrees: position.coords.heading || 0,
            accuracy_meters: position.coords.accuracy
          };
          setCurrentLocation(location);
          
          if (activeRoute) {
            updateLocation({
              vehicle_id: activeRoute.vehicle_id,
              ...location
            });
          }
        },
        (error) => {
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const handleStartRoute = async (routeId) => {
    try {
      await updateRouteStatus(routeId, 'in_progress');
      toast.success('Route started!');
      fetchRoutes();
    } catch (error) {
      toast.error('Failed to start route');
    }
  };

  const handleCompleteRoute = async (routeId) => {
    try {
      await updateRouteStatus(routeId, 'completed');
      toast.success('Route completed!');
      setActiveRoute(null);
      fetchRoutes();
    } catch (error) {
      toast.error('Failed to complete route');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading routes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="driver-dashboard">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Driver Dashboard</h1>
            <p className="text-sm opacity-90">Welcome, {user?.name}</p>
          </div>
          {currentLocation && (
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              <span className="text-sm">GPS Active</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Active Route */}
        {activeRoute ? (
          <Card data-testid="active-route-card">
            <CardHeader className="bg-accent/10">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Route
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Stops</p>
                    <p className="text-2xl font-bold">{activeRoute.stops?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-accent">
                      {activeRoute.stops?.filter(s => s.status === 'completed').length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="text-2xl font-bold">{activeRoute.estimated_distance_km} km</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {activeRoute.stops?.map((stop, index) => {
                    const shop = shops.find(s => s.id === stop.shop_id);
                    return (
                      <div
                        key={stop.shop_id}
                        className="p-4 border-l-4 bg-muted/30 rounded active:scale-95 transition-transform"
                        style={{
                          borderLeftColor: stop.status === 'completed' ? '#10B981' : '#005F73'
                        }}
                        data-testid={`stop-${index}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {stop.sequence}
                            </div>
                            <div>
                              <p className="font-medium">{shop?.name || 'Shop'}</p>
                              <p className="text-sm text-muted-foreground">{shop?.address}</p>
                            </div>
                          </div>
                          {stop.status === 'completed' && (
                            <CheckCircle className="h-6 w-6 text-accent" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  className="w-full h-12"
                  onClick={() => handleCompleteRoute(activeRoute.id)}
                  data-testid="complete-route-button"
                >
                  Complete Route
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="pending-routes-card">
            <CardHeader>
              <CardTitle className="text-xl">Today's Routes</CardTitle>
            </CardHeader>
            <CardContent>
              {routes.filter(r => r.status === 'pending').length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No routes assigned for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {routes.filter(r => r.status === 'pending').map((route, index) => (
                    <div
                      key={route.id}
                      className="p-4 border rounded-lg"
                      data-testid={`pending-route-${index}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-medium">Route #{route.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {route.stops?.length || 0} stops • {route.estimated_distance_km} km
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleStartRoute(route.id)}
                        data-testid={`start-route-${index}`}
                      >
                        Start Route
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Leaflet Map */}
        {currentLocation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MapContainer
                center={[currentLocation.latitude, currentLocation.longitude]}
                zoom={14}
                style={{ height: '300px', width: '100%' }}
              >
                <MapCenterUpdater center={currentLocation} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Current Location Marker */}
                <Marker 
                  position={[currentLocation.latitude, currentLocation.longitude]}
                  icon={createCurrentLocationIcon()}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">Your Location</h3>
                      <p className="text-sm">Speed: {currentLocation.speed_kmh.toFixed(1)} km/h</p>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Shop Markers */}
                {shops.map(shop => (
                  <Marker
                    key={shop.id}
                    position={[shop.latitude, shop.longitude]}
                    icon={createShopIcon()}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold">{shop.name}</h3>
                        <p className="text-sm">{shop.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
