import React, { useEffect, useState } from 'react';
import { getDashboardAnalytics, getSales, getRoutes } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, Warehouse, TrendingUp, MapPin, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, salesRes, routesRes] = await Promise.all([
        getDashboardAnalytics(),
        getSales({}),
        getRoutes({})
      ]);
      
      setAnalytics(analyticsRes.data);
      setSalesData(salesRes.data || []);
      setRoutesData(routesRes.data || []);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getWeeklySales = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const daySales = salesData.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate.toDateString() === date.toDateString();
      });
      
      const totalAmount = daySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      
      last7Days.push({
        date: dateStr,
        sales: daySales.length,
        amount: totalAmount
      });
    }
    
    return last7Days;
  };

  const getPaymentModeDistribution = () => {
    const distribution = { cash: 0, credit: 0, upi: 0 };
    
    salesData.forEach(sale => {
      if (sale.payment_mode) {
        distribution[sale.payment_mode] = (distribution[sale.payment_mode] || 0) + 1;
      }
    });
    
    return [
      { name: 'Cash', value: distribution.cash, color: '#10B981' },
      { name: 'Credit', value: distribution.credit, color: '#F59E0B' },
      { name: 'UPI', value: distribution.upi, color: '#3B82F6' }
    ];
  };

  const getRouteStatusDistribution = () => {
    const distribution = { pending: 0, in_progress: 0, completed: 0 };
    
    routesData.forEach(route => {
      if (route.status) {
        distribution[route.status] = (distribution[route.status] || 0) + 1;
      }
    });
    
    return [
      { name: 'Pending', value: distribution.pending },
      { name: 'In Progress', value: distribution.in_progress },
      { name: 'Completed', value: distribution.completed }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const weeklySales = getWeeklySales();
  const paymentDistribution = getPaymentModeDistribution();
  const routeStatus = getRouteStatusDistribution();

  const stats = [
    {
      title: 'Total Shops',
      value: analytics?.total_shops || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%'
    },
    {
      title: 'Active Vehicles',
      value: `${analytics?.active_vehicles || 0}/${analytics?.total_vehicles || 0}`,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '100%'
    },
    {
      title: 'Total Sales',
      value: salesData.length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+8%'
    },
    {
      title: 'Total Routes',
      value: routesData.length,
      icon: MapPin,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+15%'
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6" data-testid="analytics-page">
      <div>
        <h1 className="text-4xl md:text-5xl mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground text-lg">Comprehensive insights into your fleet operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Weekly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value, name) => {
                    if (name === 'amount') return [`₹${value.toLocaleString()}`, 'Amount'];
                    return [value, 'Sales Count'];
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#005F73" strokeWidth={2} name="Sales Count" />
                <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} name="Amount (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Payment Mode Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Route Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#005F73" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Sale Value</p>
                  <p className="text-xl font-bold">
                    ₹{salesData.length > 0 
                      ? (salesData.reduce((sum, s) => sum + (s.total_amount || 0), 0) / salesData.length).toFixed(2)
                      : '0'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Route Distance</p>
                  <p className="text-xl font-bold">
                    {routesData.length > 0
                      ? (routesData.reduce((sum, r) => sum + (r.estimated_distance_km || 0), 0) / routesData.length).toFixed(1)
                      : '0'
                    } km
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Salesmen</p>
                  <p className="text-xl font-bold">
                    {new Set(salesData.map(s => s.salesman_id)).size}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};