"use client";

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Package, Factory, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { StatCard } from '../dashboard/_components/StatCard';
import { reportsApi } from '@/lib/api/reports';
import { InventoryMaterial } from '@/lib/api/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['hsl(174, 72%, 40%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

interface ReportBatch {
  id: string;
  status: 'ongoing' | 'completed';
  quantity: number;
  estimatedOutput?: number;
  actualOutput?: number;
  wastage?: number;
  createdAt?: string;
  completedAt?: string;
}

interface ReportStockLog {
  id: string;
  materialName: string;
  type: 'add' | 'remove';
  quantity: number;
}

const Reports = () => {
  const [materials, setMaterials] = useState<InventoryMaterial[]>([]);
  const [batches, setBatches] = useState<ReportBatch[]>([]);
  const [stockLogs, setStockLogs] = useState<ReportStockLog[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const snapshot = await reportsApi.getSnapshot();

        setMaterials(snapshot.materials || []);
        setBatches((snapshot.productions || []).map((item: any) => ({
          id: item._id,
          status: item.status,
          quantity: item.batchQuantity || 0,
          estimatedOutput: item.estimatedOutput || 0,
          actualOutput: item.actualOutput || 0,
          wastage: item.wastage || 0,
          createdAt: item.created_at,
          completedAt: item.updated_at,
        })));
        setStockLogs((snapshot.stockLogs || []).map((item: any) => ({
          id: item._id,
          materialName: item.material?.name || 'Unknown',
          type: item.transaction_type === 'in' ? 'add' : 'remove',
          quantity: item.quantity,
        })));
      } catch (error) {
        console.error('Failed to load reports data', error);
      }
    };

    load();
  }, []);

  const completedBatches = batches.filter(b => b.status === 'completed');
  const avgWastage = completedBatches.length > 0
    ? completedBatches.reduce((acc, b) => {
        const wastagePercent = b.estimatedOutput ? ((b.estimatedOutput - (b.actualOutput || 0)) / b.estimatedOutput) * 100 : 0;
        return acc + wastagePercent;
      }, 0) / completedBatches.length
    : 0;

  const totalProduction = completedBatches.reduce((acc, b) => acc + b.quantity, 0);
  const totalInventoryValue = useMemo(
    () => materials.reduce((total, item) => total + (item.quantity * item.costPerUnit), 0),
    [materials]
  );
  const lowStockCount = useMemo(
    () => materials.filter((item) => item.quantity <= item.minimumStock).length,
    [materials]
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayBatches = completedBatches.filter(b => {
      const batchDate = new Date(b.completedAt || b.createdAt || new Date().toISOString());
      return batchDate.toDateString() === date.toDateString();
    });
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      production: dayBatches.reduce((acc, b) => acc + b.quantity, 0),
      wastage: dayBatches.length > 0
        ? dayBatches.reduce((acc, b) => {
            const wastagePercent = b.estimatedOutput ? ((b.estimatedOutput - (b.actualOutput || 0)) / b.estimatedOutput) * 100 : 0;
            return acc + wastagePercent;
          }, 0) / dayBatches.length
        : 0,
    };
  });

  const materialConsumption = stockLogs
    .filter(log => log.type === 'remove')
    .reduce((acc, log) => {
      acc[log.materialName] = (acc[log.materialName] || 0) + log.quantity;
      return acc;
    }, {} as Record<string, number>);

  const topConsumedMaterials = Object.entries(materialConsumption)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const stockDistribution = materials.slice(0, 4).map(m => ({
    name: m.name,
    value: m.quantity * m.costPerUnit,
  }));

  return (
    <DashboardLayout title="Reports & Analytics" subtitle="Comprehensive production insights">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Materials"
          value={materials.length}
          subtitle="Tracked items"
          icon={Package}
          delay={0}
        />
        <StatCard
          title="Total Batches"
          value={batches.length}
          subtitle={`${completedBatches.length} completed`}
          icon={Factory}
          variant="primary"
          delay={100}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          subtitle="Need restocking"
          icon={TrendingDown}
          variant={lowStockCount > 0 ? 'danger' : 'success'}
          delay={200}
        />
        <StatCard
          title="Avg Wastage"
          value={`${avgWastage.toFixed(1)}%`}
          subtitle="Per batch"
          icon={BarChart3}
          variant={avgWastage > 10 ? 'warning' : 'success'}
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Production Chart */}
          {/* Critical Items */}
        <Card className="p-6 opacity-0 animate-fade-in stagger-4 ">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-semibold">Daily Production</h2>
              <p className="text-sm text-muted-foreground">Units produced over last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last 7 days
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  stroke="hsl(174, 72%, 40%)" 
                  strokeWidth={2}
                  fill="url(#productionGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Wastage Chart */}
        <Card className="p-6 opacity-0 animate-fade-in stagger-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-semibold">Daily Wastage %</h2>
              <p className="text-sm text-muted-foreground">Wastage percentage over last 7 days</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => {
                   if (typeof value !== "number") return ["0%", "Wastage"]
                  return [`${value}%`, "Wastage"]
                   }}

                />
                <Bar 
                  dataKey="wastage" 
                  fill="hsl(38, 92%, 50%)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Material Consumption */}
        <Card className="p-6 xl:col-span-2 opacity-0 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold">Top Consumed Materials</h2>
            <p className="text-sm text-muted-foreground">Most used raw materials in production</p>
          </div>
          {topConsumedMaterials.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No consumption data yet
            </div>
          ) : (
            <div className="space-y-4">
              {topConsumedMaterials.map((item, index) => {
                const maxValue = topConsumedMaterials[0].value;
                const percentage = (item.value / maxValue) * 100;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.value} units</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Inventory Distribution */}
        <Card className="p-6 opacity-0 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold">Inventory Value</h2>
            <p className="text-sm text-muted-foreground">Distribution by material</p>
          </div>
          {stockDistribution.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No inventory data
            </div>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stockDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number | undefined) => [
                    `$${(value ?? 0).toFixed(2)}`,
                         "Value",
                              ]}

                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {stockDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">${item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Inventory</span>
              <span className="font-display text-lg font-bold text-primary">
                ${totalInventoryValue.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 opacity-0 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <h3 className="font-display font-semibold">Cost Insights</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Consider tracking additional costs like manpower, utilities, and packaging for complete profitability analysis.
          </p>
          <p className="text-xs text-primary font-medium">💡 Tip: Add expense categories in future updates</p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-success/10 to-success/5 border-success/20 opacity-0 animate-fade-in" style={{ animationDelay: '900ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="h-6 w-6 text-success" />
            <h3 className="font-display font-semibold">Wastage Reduction</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Average wastage is {avgWastage.toFixed(1)}%. Industry target is below 5%.
          </p>
          <p className="text-xs text-success font-medium">
            {avgWastage < 5 ? '✓ Great job!' : '📈 Room for improvement'}
          </p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-warning/10 to-warning/5 border-warning/20 opacity-0 animate-fade-in" style={{ animationDelay: '1000ms' }}>
          <div className="flex items-center gap-3 mb-3">
            <Factory className="h-6 w-6 text-warning" />
            <h3 className="font-display font-semibold">Production Rate</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Total production: {totalProduction} units from {completedBatches.length} batches.
          </p>
          <p className="text-xs text-warning font-medium">
            Avg: {completedBatches.length > 0 ? (totalProduction / completedBatches.length).toFixed(1) : 0} units/batch
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
