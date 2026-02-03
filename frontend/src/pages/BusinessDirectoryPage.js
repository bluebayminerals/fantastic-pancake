import React, { useState, useEffect } from 'react';
import { getShops, getDistricts, getShopsStats } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Phone, User, Package } from 'lucide-react';
import { toast } from 'sonner';

export const BusinessDirectoryPage = () => {
  const [shops, setShops] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const shopsRes = await getShops({});
      const districtsRes = await getDistricts();
      
      setShops(shopsRes.data || []);
      setDistricts(districtsRes.data.districts || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterShops = () => {
    return shops.filter(shop => {
      const matchesSearch = !searchTerm || 
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.pincode.includes(searchTerm);
      
      const matchesDistrict = selectedDistrict === 'all' || shop.district === selectedDistrict;
      
      return matchesSearch && matchesDistrict;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredShops = filterShops();

  return (
    <div className="min-h-screen bg-background" data-testid="business-directory-page">
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 md:p-8 border-b border-border/50">
        <h1 className="text-4xl md:text-5xl mb-2">Business Directory</h1>
        <p className="text-muted-foreground text-lg">All {shops.length} geotagged businesses across Kerala</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Building2 className="h-7 w-7 text-blue-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Businesses</p>
                  <p className="text-3xl font-bold">{shops.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-7 w-7 text-green-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Districts</p>
                  <p className="text-3xl font-bold">{districts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Package className="h-7 w-7 text-purple-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Showing</p>
                  <p className="text-3xl font-bold">{filteredShops.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                data-testid="search-input"
              />
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-4 py-2 rounded-md border border-border bg-secondary text-foreground"
                data-testid="district-select"
              >
                <option value="all">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedDistrict('all'); }}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Listings ({filteredShops.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessList shops={filteredShops} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Separate component for business list to avoid babel plugin issues
function BusinessList({ shops }) {
  if (shops.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No businesses found</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {shops.map(shop => <BusinessItem key={shop.id} shop={shop} />)}
    </div>
  );
}

// Individual business item component
function BusinessItem({ shop }) {
  return (
    <div className="p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-card transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold">{shop.name}</h3>
        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">{shop.district}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2 flex items-start gap-2">
        <MapPin className="h-4 w-4 mt-0.5" />
        {shop.address}
      </p>
      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Pincode: {shop.pincode}
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {shop.contact_person}
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {shop.phone}
        </div>
      </div>
    </div>
  );
}
