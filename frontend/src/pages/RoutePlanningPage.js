import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import distance from '@turf/distance';
import { point } from '@turf/helpers';
import { getShops, getVehicles, getWarehouses, optimizeRoutes, importShops, downloadShopsTemplate } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Truck, Upload, Download, Loader2, Map as MapIcon, Route as RouteIcon } from 'lucide-react';
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
const createStoreIcon = (isSelected) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${isSelected ? '32px' : '24px'};
        height: ${isSelected ? '32px' : '24px'};
        background: ${isSelected ? '#10B981' : '#00A896'};
        border: ${isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.5)'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.2s;
      ">
        <svg width="${isSelected ? '16' : '12'}" height="${isSelected ? '16' : '12'}" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
    iconAnchor: [isSelected ? 16 : 12, isSelected ? 32 : 24],
  });
};

const createWarehouseIcon = () => {
  return L.divIcon({
    className: 'custom-warehouse-marker',
    html: `
      <div style="
        padding: 8px 12px;
        background: #F59E0B;
        border: 2px solid white;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(245,158,11,0.4);
        white-space: nowrap;
      ">
        📦 Warehouse
      </div>
    `,
    iconSize: [120, 40],
    iconAnchor: [60, 40],
  });
};

const createSequenceIcon = (number) => {
  return L.divIcon({
    className: 'custom-sequence-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: #10B981;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(16,185,129,0.6);
      ">
        ${number}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
};

export const RoutePlanningPage = () => {
  const [shops, setShops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedShops, setSelectedShops] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [optimizing, setOptimizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showRoutePreview, setShowRoutePreview] = useState(false);
  const [mapCenter, setMapCenter] = useState(KERALA_CENTER);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shopsRes, vehiclesRes, warehousesRes] = await Promise.all([
        getShops(),
        getVehicles(),
        getWarehouses()
      ]);
      setShops(shopsRes.data || []);
      setVehicles(vehiclesRes.data.filter(v => v.status === 'active') || []);
      setWarehouses(warehousesRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleShopToggle = (shopId) => {
    setSelectedShops(prev => {
      const newSelection = prev.includes(shopId)
        ? prev.filter(id => id !== shopId)
        : [...prev, shopId];
      return newSelection;
    });
  };

  const handleVehicleToggle = (vehicleId) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const calculateRouteDistance = () => {
    if (selectedShops.length < 2) return 0;
    
    const selectedShopsData = shops.filter(s => selectedShops.includes(s.id));
    let totalDistance = 0;
    
    for (let i = 0; i < selectedShopsData.length - 1; i++) {
      const from = point([selectedShopsData[i].longitude, selectedShopsData[i].latitude]);
      const to = point([selectedShopsData[i + 1].longitude, selectedShopsData[i + 1].latitude]);
      totalDistance += distance(from, to, { units: 'kilometers' });
    }
    
    return totalDistance.toFixed(2);
  };

  const handleOptimize = async () => {
    if (selectedShops.length === 0 || selectedVehicles.length === 0 || !selectedWarehouse) {
      toast.error('Please select shops, vehicles, and warehouse');
      return;
    }

    setOptimizing(true);
    try {
      const response = await optimizeRoutes({
        date: selectedDate,
        shop_ids: selectedShops,
        vehicle_ids: selectedVehicles,
        warehouse_id: selectedWarehouse
      });
      
      toast.success(`${response.data.total_routes} routes optimized successfully!`);
      setSelectedShops([]);
      setSelectedVehicles([]);
    } catch (error) {
      toast.error('Route optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await importShops(file);
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error('Failed to import shops');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadShopsTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shops_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const getRoutePolyline = () => {
    if (!showRoutePreview || selectedShops.length < 2) return [];
    
    const selectedShopsData = shops.filter(s => selectedShops.includes(s.id));
    return selectedShopsData.map(shop => [shop.latitude, shop.longitude]);
  };

  useEffect(() => {
    if (showRoutePreview && selectedShops.length > 1) {
      const dist = calculateRouteDistance();
      toast.success(`Route preview: ${dist} km total distance`);
    }
  }, [showRoutePreview]);

  return (
    <div className="min-h-screen bg-background" data-testid="route-planning-page">
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 md:p-8 border-b border-border/50">
        <h1 className="text-4xl md:text-5xl mb-2">Route Planning</h1>
        <p className="text-muted-foreground text-lg">Kerala In-House Store Map - Visual Route Pre-Planning</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Kerala Map */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MapIcon className="h-6 w-6 text-primary" />
                  Kerala Store Distribution Map
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Click on store markers to select/deselect. 
                  <span className="text-accent ml-2">Green = Selected</span>
                  <span className="text-primary ml-2">Teal = Available</span>
                </p>
              </div>
              <Button
                variant={showRoutePreview ? "default" : "outline"}
                onClick={() => setShowRoutePreview(!showRoutePreview)}
                disabled={selectedShops.length < 2}
                className="flex items-center gap-2"
                data-testid="route-preview-toggle"
              >
                <RouteIcon className="h-4 w-4" />
                {showRoutePreview ? 'Hide Route' : 'Show Route Preview'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MapContainer
              center={KERALA_CENTER}
              zoom={9}
              style={{ height: '500px', width: '100%' }}
              ref={mapRef}
            >
              <MapUpdater center={mapCenter} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Warehouse Markers */}
              {warehouses.map((warehouse, index) => {
                const lat = KERALA_CENTER[0] + (index * 0.8) - 0.8;
                const lng = KERALA_CENTER[1] + (index * 0.5) - 0.5;
                return (
                  <Marker
                    key={warehouse.id}
                    position={[lat, lng]}
                    icon={createWarehouseIcon()}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-lg">{warehouse.name}</h3>
                        <p className="text-sm">{warehouse.location}</p>
                        <p className="text-sm">Pincode: {warehouse.pincode}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Shop Markers */}
              {shops.map((shop) => {
                const isSelected = selectedShops.includes(shop.id);
                return (
                  <Marker
                    key={shop.id}
                    position={[shop.latitude, shop.longitude]}
                    icon={createStoreIcon(isSelected)}
                    eventHandlers={{
                      click: (e) => {
                        // Prevent popup from blocking sequential clicks
                        e.originalEvent.stopPropagation();
                        handleShopToggle(shop.id);
                        setMapCenter([shop.latitude, shop.longitude]);
                      }
                    }}
                  >
                    <Popup autoClose={true} closeOnClick={true}>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-lg mb-2">{shop.name}</h3>
                        <p className="text-sm mb-1"><strong>Address:</strong> {shop.address}</p>
                        <p className="text-sm mb-1"><strong>Pincode:</strong> {shop.pincode}</p>
                        <p className="text-sm mb-1"><strong>Contact:</strong> {shop.contact_person}</p>
                        <p className="text-sm mb-2"><strong>Phone:</strong> {shop.phone}</p>
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t">
                          <span className="text-sm font-medium" style={{ color: isSelected ? '#10B981' : '#666' }}>
                            {isSelected ? '✓ Selected' : 'Not selected'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShopToggle(shop.id);
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              isSelected 
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            {isSelected ? 'Remove' : 'Add to Route'}
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Route Polyline */}
              {showRoutePreview && selectedShops.length > 1 && (
                <Polyline
                  positions={getRoutePolyline()}
                  color="#10B981"
                  weight={4}
                  opacity={0.8}
                />
              )}

              {/* Sequence Numbers */}
              {showRoutePreview && selectedShops.map((shopId, index) => {
                const shop = shops.find(s => s.id === shopId);
                if (!shop) return null;
                return (
                  <Marker
                    key={`seq-${shop.id}`}
                    position={[shop.latitude, shop.longitude]}
                    icon={createSequenceIcon(index + 1)}
                  />
                );
              })}
            </MapContainer>
          </CardContent>
        </Card>

        {/* Map Legend */}
        <Card className="border-border/50 bg-gradient-to-r from-card/50 to-card/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-around flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-accent border-2 border-white"></div>
                <span className="text-sm font-medium">Selected Stores ({selectedShops.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-primary border-2 border-white/50"></div>
                <span className="text-sm">Available Stores ({shops.length - selectedShops.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">📦</div>
                <span className="text-sm">Warehouses ({warehouses.length})</span>
              </div>
              {showRoutePreview && selectedShops.length > 1 && (
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-accent"></div>
                  <span className="text-sm text-accent font-medium">Route: {calculateRouteDistance()} km</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Excel Import/Export */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-2xl">Excel Import/Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={handleDownloadTemplate} className="border-primary/50 hover:bg-primary/10">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <div>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  disabled={uploading}
                  className="hidden"
                  id="excel-upload"
                />
                <label htmlFor="excel-upload">
                  <Button variant="outline" asChild disabled={uploading} className="border-accent/50 hover:bg-accent/10">
                    <span>
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Upload Stores Excel
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimization Settings */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-2xl">Route Optimization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Warehouse</label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name} - {w.location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Selection */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-xl flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-400" />
              Select Vehicles ({selectedVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedVehicles.includes(vehicle.id) 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border/50 hover:bg-card/50'
                  }`}
                  onClick={() => handleVehicleToggle(vehicle.id)}
                >
                  <Checkbox
                    checked={selectedVehicles.includes(vehicle.id)}
                    onCheckedChange={() => handleVehicleToggle(vehicle.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{vehicle.registration}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.capacity_kg}kg capacity</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Shops List */}
        <Card className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Selected Stores ({selectedShops.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {selectedShops.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Click on map markers to select stores for routing
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedShops.map((shopId, index) => {
                  const shop = shops.find(s => s.id === shopId);
                  if (!shop) return null;
                  
                  return (
                    <div
                      key={shop.id}
                      className="flex items-center justify-between p-4 border border-accent/30 rounded-lg bg-accent/5"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {showRoutePreview && (
                          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{shop.name}</p>
                          <p className="text-sm text-muted-foreground">{shop.pincode}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShopToggle(shop.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        ✕
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Optimize Button */}
        <Button
          className="w-full h-14 text-lg"
          onClick={handleOptimize}
          disabled={optimizing || selectedShops.length === 0 || selectedVehicles.length === 0}
        >
          {optimizing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Optimizing Routes...
            </>
          ) : (
            `Optimize Routes for ${selectedShops.length} Stores`
          )}
        </Button>
      </div>
    </div>
  );
};