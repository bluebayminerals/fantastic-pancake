import React, { useEffect, useState } from 'react';
import { getDashboardAnalytics, getRoutes, getVehicles } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Warehouse, TrendingUp, MapPin, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, routesRes, vehiclesRes] = await Promise.all([
        getDashboardAnalytics(),
        getRoutes({ date: new Date().toISOString().split('T')[0] }),
        getVehicles()
      ]);
      
      setAnalytics(analyticsRes.data);
      setRoutes(routesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Shops',
      value: analytics?.total_shops || 0,
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-500/10'
    },
    {
      title: 'Active Vehicles',
      value: `${analytics?.active_vehicles || 0}/${analytics?.total_vehicles || 0}`,
      icon: Truck,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-500/10'
    },
    {
      title: 'Warehouses',
      value: analytics?.total_warehouses || 0,
      icon: Warehouse,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-500/10'
    },
    {
      title: "Today's Routes",
      value: analytics?.today_routes || 0,
      icon: MapPin,
      color: 'text-orange-400',
      bgColor: 'from-orange-500/20 to-orange-500/10'
    },
    {
      title: "Today's Sales",
      value: analytics?.today_sales_count || 0,
      icon: TrendingUp,
      color: 'text-teal-400',
      bgColor: 'from-teal-500/20 to-teal-500/10'
    },
    {
      title: 'Sales Amount',
      value: `₹${(analytics?.today_sales_amount || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/20 to-emerald-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 md:p-8 border-b border-border/50">
        <h1 className="text-4xl md:text-5xl mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Welcome back! Here's your fleet overview</p>
      </div>
      
      <div className="p-6 md:p-8 space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 bg-gradient-to-br from-card to-card/50 border-border/50" data-testid={`stat-card-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Routes and Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Routes */}
        <Card data-testid="routes-card" className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-2xl">Today's Routes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {routes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No routes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routes.slice(0, 5).map((route, index) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-4 border-l-4 border-l-primary bg-primary/5 rounded border border-primary/20"
                    data-testid={`route-item-${index}`}
                  >
                    <div>
                      <p className="font-medium">Route #{route.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{route.stops?.length || 0} stops</p>
                    </div>
                    <div className="text-right">
                      <span className={
                        route.status === 'completed' ? 'text-accent' :
                        route.status === 'in_progress' ? 'text-orange-400' :
                        'text-muted-foreground'
                      }>
                        {route.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Vehicles */}
        <Card data-testid="vehicles-card" className="border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-2xl">Vehicle Fleet</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {vehicles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No vehicles registered</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.slice(0, 5).map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-4 bg-card/50 rounded border border-border/50 hover:bg-card transition-colors"
                    data-testid={`vehicle-item-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{vehicle.registration}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.capacity_kg}kg capacity</p>
                      </div>
                    </div>
                    <span className={
                      vehicle.status === 'active' ? 'text-accent' :
                      vehicle.status === 'maintenance' ? 'text-orange-400' :
                      'text-muted-foreground'
                    }>
                      {vehicle.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};