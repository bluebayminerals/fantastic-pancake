import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', null, { params: { email, password } });
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');

// Shops
export const getShops = (params) => api.get('/shops', { params });
export const createShop = (shopData) => api.post('/shops', shopData);
export const getShop = (id) => api.get(`/shops/${id}`);
export const getDistricts = () => api.get('/shops/districts');
export const getShopsStats = () => api.get('/shops/stats');

// Vehicles
export const getVehicles = () => api.get('/vehicles');
export const createVehicle = (vehicleData) => api.post('/vehicles', vehicleData);
export const assignDriver = (vehicleId, driverId) => api.put(`/vehicles/${vehicleId}/assign-driver`, null, { params: { driver_id: driverId } });

// Routes
export const getRoutes = (params) => api.get('/routes', { params });
export const optimizeRoutes = (data) => api.post('/routes/optimize', data);
export const updateRouteStatus = (routeId, status) => api.put(`/routes/${routeId}/status`, null, { params: { status } });

// Tracking
export const updateLocation = (locationData) => api.post('/tracking/location', locationData);
export const getVehicleLocations = (vehicleId, hours = 1) => api.get(`/tracking/vehicle/${vehicleId}`, { params: { hours } });

// Sales
export const createSale = (saleData) => api.post('/sales', saleData);
export const getSales = (params) => api.get('/sales', { params });

// Warehouses
export const getWarehouses = () => api.get('/warehouses');
export const createWarehouse = (data) => api.post('/warehouses', data);

// Inventory
export const getInventory = (params) => api.get('/inventory', { params });
export const createInventory = (data) => api.post('/inventory', data);

// Excel
export const downloadShopsTemplate = () => api.get('/excel/shops-template', { responseType: 'blob' });
export const importShops = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/excel/shops-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const downloadSalesReport = (startDate, endDate) => 
  api.get('/excel/sales-report', { 
    params: { start_date: startDate, end_date: endDate },
    responseType: 'blob'
  });

// Analytics
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');

export default api;