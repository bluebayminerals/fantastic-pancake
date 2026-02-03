import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getVehicles, getVehicleLocations } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Navigation, RefreshCw, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const KERALA_CENTER = [9.9312, 76.2673]; // Kochi

// Create vehicle marker icons based on status
const createVehicleIcon = (status) => {
  const colors = {
    active: '#10B981',
    idle: '#F59E0B', 
    offline: '#6B7280'
  };
  const color = colors[status] || colors.offline;
  
  return L.divIcon({
    className: 'vehicle-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1">
          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

// Component to handle map center updates
const MapCenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

export const LiveTrackingPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleLocations, setVehicleLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState(KERALA_CENTER);

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(refreshLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await getVehicles();
      const vehicleData = response.data || [];
      setVehicles(vehicleData);
      
      for (const vehicle of vehicleData) {
        await fetchVehicleLocation(vehicle.id);
      }
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleLocation = async (vehicleId) => {
    try {
      const response = await getVehicleLocations(vehicleId, 1);
      if (response.data && response.data.length > 0) {
        const latestLocation = response.data[0];
        setVehicleLocations(prev => ({
          ...prev,
          [vehicleId]: latestLocation
        }));
      }
    } catch (error) {
      console.error(`Failed to load location for vehicle ${vehicleId}`);
    }
  };

  const refreshLocations = async () => {
    setRefreshing(true);
    for (const vehicle of vehicles) {
      await fetchVehicleLocation(vehicle.id);
    }
    setRefreshing(false);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchVehicles();
    setRefreshing(false);
    toast.success('Locations refreshed');
  };

  const getVehicleStatus = (vehicle) => {
    const location = vehicleLocations[vehicle.id];
    if (!location) return 'offline';
    
    const locationTime = new Date(location.timestamp);
    const now = new Date();
    const diffMinutes = (now - locationTime) / 1000 / 60;
    
    if (diffMinutes < 5) return 'active';
    if (diffMinutes < 30) return 'idle';
    return 'offline';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'idle': return 'Idle';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    const location = vehicleLocations[vehicle.id];
    if (location) {
      setMapCenter([location.latitude, location.longitude]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeCount = vehicles.filter(v => getVehicleStatus(v) === 'active').length;
  const idleCount = vehicles.filter(v => getVehicleStatus(v) === 'idle').length;
  const offlineCount = vehicles.filter(v => getVehicleStatus(v) === 'offline').length;

  return (
    <div className="min-h-screen bg-background" data-testid="live-tracking-page">
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 md:p-8 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl mb-2">Live Vehicle Tracking</h1>
            <p className="text-muted-foreground text-lg">Real-time GPS monitoring of fleet vehicles</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
            data-testid="refresh-button"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-border/50 bg-gradient-to-br from-card/50 to-card/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Fleet</p>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Satellite className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-400">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Navigation className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Idle</p>
                  <p className="text-2xl font-bold text-yellow-400">{idleCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-gradient-to-br from-gray-500/10 to-gray-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold text-gray-400">{offlineCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle List */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-border/50">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Vehicles ({vehicles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {vehicles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No vehicles found</p>
                ) : (
                  vehicles.map(vehicle => {
                    const status = getVehicleStatus(vehicle);
                    const location = vehicleLocations[vehicle.id];
                    const isSelected = selectedVehicle?.id === vehicle.id;
                    
                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => handleVehicleSelect(vehicle)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'border-primary bg-primary/10' : 'border-border/50 hover:bg-card/50'
                        }`}
                        data-testid={`vehicle-card-${vehicle.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-foreground">{vehicle.registration}</p>
                            <p className="text-sm text-muted-foreground capitalize">{vehicle.status}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              status === 'active' ? 'bg-green-500/20 text-green-400' :
                              status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {getStatusText(status)}
                            </span>
                            <div className={`h-3 w-3 rounded-full ${getStatusColor(status)}`} />
                          </div>
                        </div>
                        
                        {location ? (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              <span>{location.speed_kmh?.toFixed(1) || 0} km/h</span>
                            </div>
                            <div>
                              Last update: {new Date(location.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No location data available</p>
                        )}
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Capacity: {vehicle.capacity_kg || 'N/A'} kg
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border-border/50">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Status Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Active (&lt; 5 min ago)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">Idle (5-30 min ago)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-400" />
                  <span className="text-muted-foreground">Offline (&gt; 30 min ago)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5 text-primary" />
                  Live Map - Kerala Region
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MapContainer
                  center={KERALA_CENTER}
                  zoom={10}
                  style={{ height: '550px', width: '100%' }}
                  data-testid="tracking-map"
                >
                  <MapCenterUpdater center={mapCenter} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {vehicles.map(vehicle => {
                    const location = vehicleLocations[vehicle.id];
                    if (!location) return null;
                    
                    const status = getVehicleStatus(vehicle);
                    
                    return (
                      <Marker
                        key={vehicle.id}
                        position={[location.latitude, location.longitude]}
                        icon={createVehicleIcon(status)}
                        eventHandlers={{
                          click: () => handleVehicleSelect(vehicle)
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[180px]">
                            <h3 className="font-bold text-base mb-2">{vehicle.registration}</h3>
                            <div className="text-sm space-y-1">
                              <p><strong>Status:</strong> <span className="capitalize">{getStatusText(status)}</span></p>
                              <p><strong>Speed:</strong> {location.speed_kmh?.toFixed(1) || 0} km/h</p>
                              <p><strong>Capacity:</strong> {vehicle.capacity_kg || 'N/A'} kg</p>
                              <p className="text-xs text-gray-500 mt-2">
                                Updated: {new Date(location.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
