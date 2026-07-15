"use client";

import { useEffect, useState } from 'react';
import { Boxes, Plus, Minus, History } from 'lucide-react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { fetchInventoryMaterials, InventoryMaterial } from '@/lib/api/material';
import { stockManagementApi } from '@/lib/api/stockmanagement';
import { triggerDashboardRefresh } from '@/lib/utils/dashboardRefresh';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface StockLog {
  id: string;
  materialName: string;
  type: 'add' | 'remove';
  quantity: number;
  remarks?: string;
  createdAt: string;
}

const StockManagement = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<InventoryMaterial[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'remove'>('add');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventory, logsRes] = await Promise.all([
        fetchInventoryMaterials(),
        stockManagementApi.getTransactions(),
      ]);

      const logs = logsRes.data?.data || [];
      const mappedLogs: StockLog[] = logs.map((log: any) => ({
        id: log._id,
        materialName: log.material?.name || 'Unknown Material',
        type: log.transaction_type === 'in' ? 'add' : 'remove',
        quantity: log.quantity,
        remarks: log.description,
        createdAt: log.createdAt,
      }));

      setMaterials(inventory);
      setStockLogs(mappedLogs);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load stock data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMaterial || !quantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await stockManagementApi.createTransaction({
        material: selectedMaterial,
        quantity: parseFloat(quantity),
        transaction_type: actionType === 'add' ? 'in' : 'out',
        description: remarks,
      });

      toast({
        title: 'Success',
        description: `Stock ${actionType === 'add' ? 'added' : 'removed'} successfully`,
      });

      setSelectedMaterial('');
      setQuantity('');
      setRemarks('');
      setIsOpen(false);
      await loadData();
      triggerDashboardRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update stock',
        variant: 'destructive',
      });
    }
  };

  const openDialog = (type: 'add' | 'remove') => {
    setActionType(type);
    setIsOpen(true);
  };

  return (
    <DashboardLayout title="Stock Management" subtitle="Adjust inventory levels">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <Boxes className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stock Adjustments</p>
            <p className="font-display text-2xl font-bold">{stockLogs.length}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="success" onClick={() => openDialog('add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
          <Button variant="destructive" onClick={() => openDialog('remove')}>
            <Minus className="h-4 w-4 mr-2" />
            Remove Stock
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {actionType === 'add' ? ' Add Stock' : ' Remove Stock'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Material Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                Select Material
              </label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Choose a material" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border">
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.quantity} {m.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                Quantity
              </label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Remarks Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                Remarks (Optional)
              </label>
              <Textarea
                placeholder={actionType === 'add' ? "e.g., New shipment received from supplier" : "e.g., Spoiled items, damaged packaging"}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-20 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant={actionType === 'add' ? 'success' : 'destructive'}
                className="flex-1"
              >
                {actionType === 'add' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <Card className="flex items-center justify-center py-16 mb-8">
          <p className="text-muted-foreground">Loading stock data...</p>
        </Card>
      ) : (
      <>
      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {materials.map((material, index) => (
          <Card 
            key={material.id}
            className="p-4 opacity-0 animate-scale-in border-b border-border"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold">{material.name}</h3>
              <span className={`text-sm font-medium ${
                material.quantity <= material.minimumStock ? 'text-destructive' : 'text-success'
              }`}>
                {material.quantity} {material.unit}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSelectedMaterial(material.id);
                  openDialog('add');
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSelectedMaterial(material.id);
                  openDialog('remove');
                }}
              >
                <Minus className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Stock History */}
      <Card className="opacity-0 animate-fade-in stagger-4 border-b border-border">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <History className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-display text-lg font-semibold">Stock History</h2>
            <p className="text-sm text-muted-foreground">Recent stock adjustments</p>
          </div>
        </div>

        {stockLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No stock adjustments yet</p>
          </div>
        ) : (
          <>
          <div className="px-6 py-4 border-b border-border">
            <Select value={filterMaterial} onValueChange={setFilterMaterial}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by material" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border">
                <SelectItem value="all">All Materials</SelectItem>
                {Array.from(new Set(stockLogs.map(log => log.materialName))).map((material) => (
                  <SelectItem key={material} value={material}>{material}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="divide-y divide-border">
            {stockLogs
              .filter((log) => filterMaterial === 'all' || log.materialName === filterMaterial)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10)
              .map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors ">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    log.type === 'add' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {log.type === 'add' ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{log.materialName}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.remarks || (log.type === 'add' ? 'Stock added' : 'Stock removed')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    log.type === 'add' ? 'text-success' : 'text-destructive'
                  }`}>
                    {log.type === 'add' ? '+' : '-'}{log.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </Card>
      </>
      )}
    </DashboardLayout>
  );
};

export default StockManagement;
