import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, MapIcon, Navigation2, BarChart3, Building2, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/route-planning', label: 'Route Planning', icon: MapIcon },
    { to: '/live-tracking', label: 'Live Tracking', icon: Navigation2 },
    { to: '/business-directory', label: 'Business Directory', icon: Building2 },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const links = user?.role === 'admin' ? adminLinks : [];

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <nav className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">BB</span>
              </div>
              BLUE BAY
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-2">
              {links.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="gap-2"
                      data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-muted-foreground">
              {user?.name} ({user?.role})
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex gap-2"
              data-testid="logout-button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-2">
            {links.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};