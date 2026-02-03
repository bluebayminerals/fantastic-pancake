import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Toaster } from 'sonner';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { SalesmanDashboard } from './pages/SalesmanDashboard';
import { RoutePlanningPage } from './pages/RoutePlanningPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BusinessDirectoryPage } from './pages/BusinessDirectoryPage';
import { Navigation } from './components/Navigation';
import './index.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navigation />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {user?.role === 'admin' && <Navigate to="/admin" replace />}
              {user?.role === 'driver' && <Navigate to="/driver" replace />}
              {user?.role === 'salesman' && <Navigate to="/salesman" replace />}
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/route-planning"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RoutePlanningPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/live-tracking"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LiveTrackingPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/business-directory"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <BusinessDirectoryPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/salesman"
          element={
            <ProtectedRoute allowedRoles={['salesman']}>
              <SalesmanDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;