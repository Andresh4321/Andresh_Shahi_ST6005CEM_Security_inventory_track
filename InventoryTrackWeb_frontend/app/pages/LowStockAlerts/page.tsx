"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, Package, TrendingDown, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { fetchInventoryMaterials, InventoryMaterial } from '@/lib/api/material';

export default function LowStockAlerts() {
  const router = useRouter();
  const [materials, setMaterials] = useState<InventoryMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const inventory = await fetchInventoryMaterials();
        setMaterials(inventory);
      } catch (error) {
        console.error('Failed to load low-stock data', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);
  
  const criticalItems = materials.filter(m => (m.quantity / m.minimumStock) * 100 <= 50);
  const lowItems = materials.filter(m => {
    const percentage = (m.quantity / m.minimumStock) * 100;
    return percentage > 50 && percentage <= 100;
  });
  const normalItems = materials.filter(m => (m.quantity / m.minimumStock) * 100 > 100);

  const getStockStatus = (quantity: number, minimum: number) => {
    const percentage = (quantity / minimum) * 100;
    if (percentage <= 50) return { label: 'Critical', color: 'destructive', bgColor: 'bg-destructive/10 border-destructive/30' };
    if (percentage <= 100) return { label: 'Low', color: 'warning', bgColor: 'bg-warning/10 border-warning/30' };
    return { label: 'Normal', color: 'success', bgColor: 'bg-success/10 border-success/30' };
  };

  return (
    <DashboardLayout title="Low Stock Alerts" subtitle="Monitor inventory levels">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-destructive/30 bg-destructive/5 opacity-0 animate-fade-in border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Critical Stock</p>
              <p className="font-display text-3xl font-bold text-destructive">{criticalItems.length}</p>
              <p className="text-sm text-muted-foreground">Below 50% minimum</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/20">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-warning/30 bg-warning/5 opacity-0 animate-fade-in stagger-1 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-warning">Low Stock</p>
              <p className="font-display text-3xl font-bold text-warning">{lowItems.length}</p>
              <p className="text-sm text-muted-foreground">At or below minimum</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-warning/20">
              <TrendingDown className="h-7 w-7 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-success/30 bg-success/5 opacity-0 animate-fade-in stagger-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-success">Well Stocked</p>
              <p className="font-display text-3xl font-bold text-success">{normalItems.length}</p>
              <p className="text-sm text-muted-foreground">Above minimum level</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/20">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts List */}
      {loading ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">Loading inventory...</p>
        </Card>
      ) : materials.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No materials to monitor</h3>
          <p className="text-muted-foreground mb-6">Add materials to start tracking stock levels</p>
          <Button variant="gradient" onClick={() => router.push('/Materials')}>
            Add Materials
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Critical Items */}
          {criticalItems.length > 0 && (
            <div className="opacity-0 animate-fade-in stagger-3 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Critical Stock ({criticalItems.length})
              </h2>
              <div className="space-y-3">
                {criticalItems.map((item) => {
                  const percentage = (item.quantity / item.minimumStock) * 100;
                  return (
                    <Card key={item.id} className="p-4 border-destructive/30 bg-destructive/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
                            <Package className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} / {item.minimumStock} {item.unit}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => router.push('/StockManagement')}>
                          Restock Now
                        </Button>
                      </div>
                      <div className="w-full bg-destructive/20 rounded-full h-2">
                        <div 
                          className="bg-destructive h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Low Items */}
          {lowItems.length > 0 && (
            <div className="opacity-0 animate-fade-in stagger-4">
              <h2 className="font-display text-lg font-semibold text-warning mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Low Stock ({lowItems.length})
              </h2>
              <div className="space-y-3">
                {lowItems.map((item) => {
                  const percentage = (item.quantity / item.minimumStock) * 100;
                  return (
                    <Card key={item.id} className="p-4 border-warning/30 bg-warning/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                            <Package className="h-5 w-5 text-warning" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} / {item.minimumStock} {item.unit}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="warning" onClick={() => router.push('/StockManagement')}>
                          Add Stock
                        </Button>
                      </div>
                      <div className="w-full bg-warning/20 rounded-full h-2">
                        <div 
                          className="bg-warning h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Normal Items */}
          {normalItems.length > 0 && (
            <div className="opacity-0 animate-fade-in stagger-5">
              <h2 className="font-display text-lg font-semibold text-success mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Well Stocked ({normalItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {normalItems.map((item) => {
                  const percentage = Math.min((item.quantity / item.minimumStock) * 100, 200);
                  return (
                    <Card key={item.id} className="p-4 border-success/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <span className="text-sm text-success font-medium">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-success h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

