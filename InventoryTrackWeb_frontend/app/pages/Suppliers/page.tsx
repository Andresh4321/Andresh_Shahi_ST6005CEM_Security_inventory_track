"use client";

import { useEffect, useState } from 'react';
import { Users, Plus, Search, Star, Phone, Mail, Trash2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/app/hooks/use-toast';
import { supplierApi } from '@/lib/api/suppliers';
import { messagingApi } from '@/lib/api/messaging';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Supplier {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  products: string[];
  createdAt: string;
}

const Suppliers = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [messagingSupplier, setMessagingSupplier] = useState<Supplier | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    products: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierApi.getAll();
      const rows = response.data?.data || [];
      const mapped: Supplier[] = rows.map((item: any) => ({
        id: item._id,
        name: item.name,
        email: item.email,
        contactNumber: item.contact_number,
        products: item.products || [],
        createdAt: item.createdAt,
      }));
      setSuppliers(mapped);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load suppliers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contactNumber || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await supplierApi.create({
        name: formData.name,
        email: formData.email,
        contact_number: formData.contactNumber,
        products: formData.products.split(',').map(p => p.trim()).filter(Boolean),
      });

      toast({
        title: 'Success',
        description: 'Supplier added successfully',
      });

      setFormData({ name: '', contactNumber: '', email: '', products: '' });
      setIsOpen(false);
      await loadSuppliers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add supplier',
        variant: 'destructive',
      });
    }
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const handleDelete = async (id: string) => {
    try {
      await supplierApi.delete(id);
      toast({ title: 'Deleted', description: 'Supplier removed' });
      await loadSuppliers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete supplier',
        variant: 'destructive',
      });
    }
  };

  const handleMessageSupplier = async (supplier: Supplier) => {
    try {
      setMessagingSupplier(supplier);
      setMessageError(null);
      setMessageLoading(true);

      // Check if supplier email exists as a user
      const checkResponse = await messagingApi.checkUserExists(supplier.email);

      if (!checkResponse.data?.success) {
        setMessageError(`${supplier.email} is not registered in the app`);
        toast({
          title: 'User Not Found',
          description: `${supplier.email} is not registered in the app`,
          variant: 'destructive',
        });
        return;
      }

      // Get or create conversation
      const convResponse = await messagingApi.getOrCreateConversation(supplier.email);
      
      // Navigate to Messaging page with conversation ID
      router.push(`/Messaging`);
      
      toast({
        title: 'Success',
        description: 'Opening conversation...',
      });
    } catch (error: any) {
      setMessageError(error.message || 'Failed to start conversation');
      toast({
        title: 'Error',
        description: error.message || 'Failed to start conversation',
        variant: 'destructive',
      });
    } finally {
      setMessageLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(search) ||
      supplier.products.some(p => p.toLowerCase().includes(search))
    );
  });

  // Sort: favorites first, then by date
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    const aFav = favoriteIds.includes(a.id);
    const bFav = favoriteIds.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <DashboardLayout title="Suppliers" subtitle="Manage your supplier network">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Suppliers</p>
            <p className="font-display text-2xl font-bold">{suppliers.length}</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">✨ Add New Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Supplier Name */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                  Supplier Name
                </label>
                <Input
                  placeholder="e.g., Fresh Farms Co."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10"
                />
              </div>

              {/* Contact & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                    Contact Number
                  </label>
                  <Input
                    placeholder="e.g., +1 234 567 8900"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="supplier@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Products */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">4</span>
                  Products (comma separated)
                </label>
                <Input
                  placeholder="e.g., Eggs, Flour, Sugar"
                  value={formData.products}
                  onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                  className="h-10"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="flex-1">
                  Add Supplier
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground " />
        <Input
          placeholder="Search by supplier name or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {loading ? (
        <Card className="flex flex-col items-center justify-center py-16 ">
          <p className="text-muted-foreground">Loading suppliers...</p>
        </Card>
      ) : sortedSuppliers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 ">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6 ">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">
            {searchTerm ? 'No suppliers found' : 'No suppliers yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? 'Try a different search term' : 'Add your first supplier to get started'}
          </p>
          {!searchTerm && (
            <Button variant="gradient" onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Supplier
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {sortedSuppliers.map((supplier, index) => (
            <Card 
              key={supplier.id}
              className="p-5 hover:shadow-md transition-all duration-200 opacity-0 animate-scale-in border-b border-border"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4 ">
                <div className="flex items-center gap-3 ">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-lg ">
                    {supplier.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(supplier.id)}
                  >
                    <Star className={`h-4 w-4 ${favoriteIds.includes(supplier.id) ? 'fill-warning text-warning' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {supplier.contactNumber}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {supplier.email}
                </div>
              </div>

              {supplier.products.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Products:</p>
                  <div className="flex flex-wrap gap-1">
                    {supplier.products.map((product) => (
                      <span key={product} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Button */}
              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleMessageSupplier(supplier)}
                  disabled={messageLoading && messagingSupplier?.id === supplier.id}
                >
                  {messageLoading && messagingSupplier?.id === supplier.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Supplier
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Suppliers;
