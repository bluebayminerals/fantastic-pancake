import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getSales, createSale, getShops } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const SalesmanDashboard = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [shops, setShops] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [shopId, setShopId] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('0');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const salesResponse = await getSales({ salesman_id: user.id });
      const shopsResponse = await getShops();
      setSales(salesResponse.data || []);
      setShops(shopsResponse.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const unitPrice = parseFloat(price) || 0;
    return qty * unitPrice;
  };

  const handleSubmit = async () => {
    if (!shopId) {
      toast.error('Please select a shop');
      return;
    }
    if (!product || !quantity || !price) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const total = calculateTotal();
      await createSale({
        shop_id: shopId,
        salesman_id: user.id,
        items: [{ 
          product_name: product, 
          quantity: parseFloat(quantity), 
          unit_price: parseFloat(price), 
          total_price: total 
        }],
        total_amount: total,
        payment_mode: paymentMode,
        notes: notes
      });
      
      toast.success('Sale recorded!');
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Failed to record sale');
    }
  };

  const resetForm = () => {
    setShopId('');
    setProduct('');
    setQuantity('1');
    setPrice('0');
    setPaymentMode('cash');
    setNotes('');
  };

  const getTodayCount = () => {
    const today = new Date().toDateString();
    let count = 0;
    for (const sale of sales) {
      if (sale.sale_date && new Date(sale.sale_date).toDateString() === today) {
        count++;
      }
    }
    return count;
  };

  const getTodayAmount = () => {
    const today = new Date().toDateString();
    let amount = 0;
    for (const sale of sales) {
      if (sale.sale_date && new Date(sale.sale_date).toDateString() === today) {
        amount += sale.total_amount || 0;
      }
    }
    return amount;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todayCount = getTodayCount();
  const todayAmount = getTodayAmount();

  return (
    <div className="min-h-screen bg-background" data-testid="salesman-dashboard">
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border/50">
        <h1 className="text-3xl font-bold">Salesman Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today's Sales</p>
                  <p className="text-3xl font-bold">{todayCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-green-400">₹{todayAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 text-lg" size="lg" data-testid="add-sale-button">
              <Plus className="mr-2 h-5 w-5" />
              Record New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">Record Sale</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Shop *</label>
                <Select value={shopId} onValueChange={setShopId}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Product *</label>
                <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product name" className="bg-secondary border-border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity *</label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price *</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" className="bg-secondary border-border" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Payment Mode</label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" className="bg-secondary border-border" />
              </div>

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-2xl font-bold text-primary">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No sales yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.slice(0, 10).map((sale, i) => {
                  const shop = shops.find(s => s.id === sale.shop_id);
                  return (
                    <div key={sale.id} className="p-4 border border-border/50 rounded-lg bg-card/50 hover:bg-card transition-colors">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{shop?.name || 'Shop'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-accent">₹{sale.total_amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground capitalize">{sale.payment_mode}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};