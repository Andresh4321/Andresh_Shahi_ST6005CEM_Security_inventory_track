"use client";

import { useState, useEffect } from 'react';
import { Plus, Package, Trash2, Edit2 } from 'lucide-react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { materialsAPI, stockAPI } from '@/lib/api/endpoints';
import { triggerDashboardRefresh } from '@/lib/utils/dashboardRefresh';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Material {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  costPerUnit: number;
  minimumStock: number;
}

const Materials = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    quantity: '',
    costPerUnit: '',
    minimumStock: '',
  });

  const units = ['kg', 'pieces', 'liter'];

  // Fetch materials from backend on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      
      // Fetch materials and stock data
      const [materialsResponse, stockResponse] = await Promise.all([
        materialsAPI.getAll(),
        stockAPI.getCurrentStock()
      ]);
      
      console.log('Fetched materials:', materialsResponse.data);
      console.log('Fetched stock:', stockResponse.data);
      
      const backendMaterials = materialsResponse.data.data || [];
      const stockData = stockResponse.data.data || [];
      
      // Create a map of material ID to quantity
      const stockMap = new Map();
      stockData.forEach((stock: any) => {
        stockMap.set(stock.material?._id || stock.material, stock.quantity || 0);
      });
      
      // Transform backend data to frontend format
      const transformedMaterials = backendMaterials.map((material: any) => ({
        id: material._id,
        name: material.name,
        unit: material.unit,
        costPerUnit: material.unit_price,
        minimumStock: material.minimum_stock,
        quantity: stockMap.get(material._id) || 0,
      }));
      
      setMaterials(transformedMaterials);
    } catch (error: any) {
      console.error('Failed to fetch materials:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unit || !formData.quantity || !formData.costPerUnit || !formData.minimumStock) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Backend expects: unit_price and minimum_stock (snake_case)
      const materialData = {
        name: formData.name,
        unit: formData.unit,
        unit_price: parseFloat(formData.costPerUnit),
        minimum_stock: parseFloat(formData.minimumStock),
      };

      const response = await materialsAPI.create(materialData);
      const createdMaterial = response.data.data;
      
      // Create initial stock if quantity > 0
      const initialQuantity = parseFloat(formData.quantity);
      if (initialQuantity > 0 && createdMaterial?._id) {
        await stockAPI.createTransaction({
          material: createdMaterial._id,
          quantity: initialQuantity,
          transaction_type: 'in',
          description: 'Initial stock'
        });
      }

      toast({
        title: "Success",
        description: "Material added successfully",
      });

      setFormData({ name: '', unit: '', quantity: '', costPerUnit: '', minimumStock: '' });
      setIsOpen(false);
      
      // Refresh the materials list
      await fetchMaterials();
      triggerDashboardRefresh();
      triggerDashboardRefresh();
    } catch (error: any) {
      console.error('Failed to create material:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add material",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await materialsAPI.delete(id);
      
      toast({
        title: "Deleted",
        description: `${name} has been removed`,
      });
      
      // Refresh the materials list
      await fetchMaterials();
      triggerDashboardRefresh();
    } catch (error: any) {
      console.error('Failed to delete material:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      unit: material.unit,
      quantity: material.quantity.toString(),
      costPerUnit: material.costPerUnit.toString(),
      minimumStock: material.minimumStock.toString(),
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unit || !formData.costPerUnit || !formData.minimumStock) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!editingMaterial) return;

    try {
      // Backend expects: unit_price and minimum_stock (snake_case)
      const materialData = {
        name: formData.name,
        unit: formData.unit,
        unit_price: parseFloat(formData.costPerUnit),
        minimum_stock: parseFloat(formData.minimumStock),
      };

      await materialsAPI.update(editingMaterial.id, materialData);
      
      // Note: quantity changes should be handled through Stock Management page

      toast({
        title: "Success",
        description: "Material updated successfully",
      });

      setFormData({ name: '', unit: '', quantity: '', costPerUnit: '', minimumStock: '' });
      setEditingMaterial(null);
      setIsEditOpen(false);
      
      // Refresh the materials list
      await fetchMaterials();
    } catch (error: any) {
      console.error('Failed to update material:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update material",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Raw Materials" subtitle="Manage your inventory ingredients">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Materials</p>
            <p className="font-display text-2xl font-bold">{materials.length}</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl"> Add New Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Material Name */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                  Material Name
                </label>
                <Input
                  placeholder="e.g., Eggs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10"
                />
              </div>

              {/* Unit & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                    Unit
                  </label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                    Initial Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Cost & Minimum Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">4</span>
                    Cost per Unit ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.50"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">5</span>
                    Minimum Stock
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 20"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="flex-1">
                  Add Material
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Material Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-lg ">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">✏️ Edit Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-6 mt-6">
              {/* Material Name */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                  Material Name
                </label>
                <Input
                  placeholder="e.g., Eggs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10"
                />
              </div>

              {/* Unit & Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                    Unit
                  </label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                    Cost per Unit ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.50"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Minimum Stock */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">4</span>
                  Minimum Stock
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>💡 Tip:</strong> To adjust quantity, use the Stock Management page.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingMaterial(null);
                    setFormData({ name: '', unit: '', quantity: '', costPerUnit: '', minimumStock: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="flex-1">
                  Update Material
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Loading materials...</p>
        </div>
      ) : materials.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 ">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6 ">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No materials yet</h3>
          <p className="text-muted-foreground mb-6">Add your first raw material to get started</p>
          <Button variant="gradient" onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Material
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
          {materials.map((material, index) => {
            const isLowStock = material.quantity <= material.minimumStock;
            return (
              <Card 
                key={material.id}
                className={`p-4 hover:shadow-md transition-all duration-200 opacity-0 animate-scale-in border-b border-border ${
                  isLowStock ? 'border-destructive/50 bg-destructive/5' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3 ">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg  ${
                    isLowStock ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'
                  }`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEdit(material)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(material.id, material.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-display font-semibold text-foreground mb-1 ">{material.name}</h3>
                
                {isLowStock && (
                  <span className="inline-block text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full mb-2">
                    Low Stock!
                  </span>
                )}
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Stock: <span className="font-medium text-foreground">{material.quantity} {material.unit}</span></p>
                  <p>Min: {material.minimumStock} {material.unit}</p>
                  <p>Cost: ${material.costPerUnit}/{material.unit}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm">
                    Total Value: <span className="font-semibold text-primary">${(material.quantity * material.costPerUnit).toFixed(2)}</span>
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Materials;
