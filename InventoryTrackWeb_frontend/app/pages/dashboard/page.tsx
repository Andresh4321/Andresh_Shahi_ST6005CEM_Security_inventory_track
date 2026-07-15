"use client";

import { useEffect, useMemo, useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Factory, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  RefreshCw
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { StatCard } from './_components/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { fetchInventoryMaterials, InventoryMaterial } from '@/lib/api/material';
import { productionAPI } from '@/lib/api/production';

interface DashboardBatch {
  id: string;
  recipeName: string;
  quantity: number;
  estimatedOutput: number;
  wastage?: number;
  status: 'ongoing' | 'completed';
  createdAt?: string;
  completedAt?: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [materials, setMaterials] = useState<InventoryMaterial[]>([]);
  const [batches, setBatches] = useState<DashboardBatch[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      const [inventory, productionRes] = await Promise.all([
        fetchInventoryMaterials(),
        productionAPI.getAll(),
      ]);

      const rawProductions = productionRes.data?.data || [];
      const mappedBatches: DashboardBatch[] = rawProductions.map((item: any) => ({
        id: item._id,
        recipeName: item.recipe?.name || 'Unknown Recipe',
        quantity: item.batchQuantity || 0,
        estimatedOutput: item.estimatedOutput || 0,
        wastage: item.wastage || 0,
        status: item.status,
        createdAt: item.created_at,
        completedAt: item.updated_at,
      }));

      setMaterials(inventory);
      setBatches(mappedBatches);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadData();
    }, 30000);

    // Refresh data when tab/window becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    // Refresh data when window regains focus (navigating back from other pages)
    const handleFocus = () => {
      loadData();
    };

    // Listen for data changes from other pages/tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboard_refresh_trigger') {
        loadData();
        // Clear the trigger
        localStorage.removeItem('dashboard_refresh_trigger');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup interval and listeners on unmount
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const lowStockItems = useMemo(
    () => materials.filter((m) => m.quantity <= m.minimumStock),
    [materials]
  );
  const inventoryValue = useMemo(
    () => materials.reduce((total, m) => total + (m.quantity * m.costPerUnit), 0),
    [materials]
  );
  const activeBatches = batches.filter(b => b.status === 'ongoing').length;
  const completedBatches = batches.filter(b => b.status === 'completed');
  const avgWastage = completedBatches.length > 0
    ? completedBatches.reduce((acc, b) => acc + (b.wastage || 0), 0) / completedBatches.length
    : 0;

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's your inventory overview.">
      {/* Refresh Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {lastUpdated && (
            <>
              Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 30s
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 ">
        <StatCard
          title="Total Materials"
          value={materials.length}
          subtitle="Tracked items"
          icon={Package}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          subtitle="Require attention"
          icon={AlertTriangle}
          variant={lowStockItems.length > 0 ? 'danger' : 'success'}
          delay={100}
        />
        <StatCard
          title="Inventory Value"
          value={`$${inventoryValue.toLocaleString()}`}
          subtitle="Total worth"
          icon={DollarSign}
          variant="primary"
          delay={200}
        />
        <StatCard
          title="Active Batches"
          value={activeBatches}
          subtitle="In production"
          icon={Factory}
          variant="warning"
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="xl:col-span-2 p-6 opacity-0 animate-fade-in stagger-4 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold">Production Overview</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/Production')}>
              View All
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {batches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Factory className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">No production batches yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking your production by creating your first batch
              </p>
              <Button onClick={() => router.push('/Production')}>
                Start Production
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.slice(0, 5).map((batch, index) => (
                <div 
                  key={batch.id}
                  className="flex items-center justify-between p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                      batch.status === 'ongoing' 
                        ? 'bg-warning/20 text-warning border-2 border-warning/30' 
                        : 'bg-success/20 text-success border-2 border-success/30'
                    }`}>
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{batch.recipeName}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {batch.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                      batch.status === 'ongoing'
                        ? 'bg-warning text-warning-foreground'
                        : 'bg-success text-success-foreground'
                    }`}>
                      {batch.status === 'ongoing' ? 'In Progress' : 'Completed'}
                    </span>
                    {batch.wastage !== undefined && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Wastage: {batch.wastage.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Low Stock Panel */}
        <Card className="p-6 opacity-0 animate-fade-in stagger-5 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold">Low Stock Alert</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/LowStockAlerts')}>
              View All
            </Button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20 mb-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">All items are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => {
                const percentage = (item.quantity / item.minimumStock) * 100;
                return (
                  <div key={item.id} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-destructive text-sm font-medium">
                        {item.quantity} / {item.minimumStock}
                      </span>
                    </div>
                    <div className="w-full bg-destructive/20 rounded-full h-1.5">
                      <div 
                        className="bg-destructive h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
        {[
          { label: 'Add Material', icon: Package, href: '/Materials', bgColor: 'bg-primary/10', textColor: 'text-primary' },
          { label: 'Start Production', icon: Factory, href: '/Production', bgColor: 'bg-warning/10', textColor: 'text-warning' },
          { label: 'Manage Stock', icon: Layers, href: '/StockManagement', bgColor: 'bg-success/10', textColor: 'text-success' },
          { label: 'View Reports', icon: TrendingUp, href: '/Reports', bgColor: 'bg-muted', textColor: 'text-muted-foreground' },
        ].map((action, index) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 justify-start gap-3 opacity-0 animate-fade-in hover:border-primary hover:bg-primary/5 border-b border-border"
            style={{ animationDelay: `${600 + index * 100}ms` }}
            onClick={() => router.push(action.href)}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bgColor}`}>
              <action.icon className={`h-5 w-5 ${action.textColor}`} />
            </div>
            <span className="font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
