import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Material, Supplier, StockLog, Recipe, ProductionBatch } from '../types';

interface AppContextType {
  materials: Material[];
  suppliers: Supplier[];
  stockLogs: StockLog[];
  recipes: Recipe[];
  batches: ProductionBatch[];
  addMaterial: (material: Omit<Material, 'id' | 'createdAt'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addStockLog: (log: Omit<StockLog, 'id' | 'createdAt'>) => void;
  updateStock: (materialId: string, quantity: number, type: 'add' | 'remove', remarks: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  startBatch: (batch: Omit<ProductionBatch, 'id' | 'createdAt' | 'status'>) => void;
  completeBatch: (id: string, actualOutput: number) => void;
  getLowStockMaterials: () => Material[];
  getTotalInventoryValue: () => number;
  clearAppData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to get user-specific storage key
const getStorageKey = (baseKey: string, userId?: string) => {
  return userId ? `${baseKey}_${userId}` : baseKey;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with empty state - will be hydrated from localStorage on client
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load from localStorage only on client side and when user changes
  useEffect(() => {
    // Get user ID from localStorage
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData)?.id : null;
    
    // If user ID changed, clear old data and load new user's data
    if (userId !== currentUserId) {
      setCurrentUserId(userId);
      
      const savedMaterials = localStorage.getItem(getStorageKey('inventorytrack_materials', userId));
      const savedSuppliers = localStorage.getItem(getStorageKey('inventorytrack_suppliers', userId));
      const savedStockLogs = localStorage.getItem(getStorageKey('inventorytrack_stocklogs', userId));
      const savedRecipes = localStorage.getItem(getStorageKey('inventorytrack_recipes', userId));
      const savedBatches = localStorage.getItem(getStorageKey('inventorytrack_batches', userId));

      if (savedMaterials) {
        const parsed = JSON.parse(savedMaterials);
        console.log('Loaded materials for user:', userId, 'count:', parsed.length);
        setMaterials(parsed);
      } else {
        setMaterials([]);
      }
      if (savedSuppliers) {
        const parsed = JSON.parse(savedSuppliers);
        console.log('Loaded suppliers for user:', userId, 'count:', parsed.length);
        setSuppliers(parsed);
      } else {
        setSuppliers([]);
      }
      if (savedStockLogs) {
        setStockLogs(JSON.parse(savedStockLogs));
      } else {
        setStockLogs([]);
      }
      if (savedRecipes) {
        const parsed = JSON.parse(savedRecipes);
        console.log('Loaded recipes for user:', userId, 'count:', parsed.length);
        setRecipes(parsed);
      } else {
        setRecipes([]);
      }
      if (savedBatches) {
        setBatches(JSON.parse(savedBatches));
      } else {
        setBatches([]);
      }
    }
    
    setIsHydrated(true);
  }, []);

  // Listen for logout event from AuthContext
  useEffect(() => {
    const handleLogout = () => {
      console.log('Logout event received, clearing app data');
      setMaterials([]);
      setSuppliers([]);
      setStockLogs([]);
      setRecipes([]);
      setBatches([]);
      setCurrentUserId(null);
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  // Listen for storage changes (for user/token changes) to detect logout or user switch
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If token is removed, clear all app data
      if (e.key === 'token' && e.newValue === null) {
        console.log('Token removed, clearing app data');
        setMaterials([]);
        setSuppliers([]);
        setStockLogs([]);
        setRecipes([]);
        setBatches([]);
        setCurrentUserId(null);
      }
      // If user data changed, reload
      if (e.key === 'user') {
        const userData = e.newValue ? JSON.parse(e.newValue) : null;
        const userId = userData?.id || null;
        
        if (userId !== currentUserId) {
          console.log('User changed from', currentUserId, 'to', userId);
          setCurrentUserId(userId);
          
          // Load new user's data
          const savedMaterials = localStorage.getItem(getStorageKey('inventorytrack_materials', userId));
          const savedSuppliers = localStorage.getItem(getStorageKey('inventorytrack_suppliers', userId));
          const savedStockLogs = localStorage.getItem(getStorageKey('inventorytrack_stocklogs', userId));
          const savedRecipes = localStorage.getItem(getStorageKey('inventorytrack_recipes', userId));
          const savedBatches = localStorage.getItem(getStorageKey('inventorytrack_batches', userId));

          setMaterials(savedMaterials ? JSON.parse(savedMaterials) : []);
          setSuppliers(savedSuppliers ? JSON.parse(savedSuppliers) : []);
          setStockLogs(savedStockLogs ? JSON.parse(savedStockLogs) : []);
          setRecipes(savedRecipes ? JSON.parse(savedRecipes) : []);
          setBatches(savedBatches ? JSON.parse(savedBatches) : []);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUserId]);

  useEffect(() => {
    if (!isHydrated || !currentUserId) return;
    localStorage.setItem(getStorageKey('inventorytrack_materials', currentUserId), JSON.stringify(materials));
  }, [materials, isHydrated, currentUserId]);

  useEffect(() => {
    if (!isHydrated || !currentUserId) return;
    localStorage.setItem(getStorageKey('inventorytrack_suppliers', currentUserId), JSON.stringify(suppliers));
  }, [suppliers, isHydrated, currentUserId]);

  useEffect(() => {
    if (!isHydrated || !currentUserId) return;
    localStorage.setItem(getStorageKey('inventorytrack_stocklogs', currentUserId), JSON.stringify(stockLogs));
  }, [stockLogs, isHydrated, currentUserId]);

  useEffect(() => {
    if (!isHydrated || !currentUserId) return;
    localStorage.setItem(getStorageKey('inventorytrack_recipes', currentUserId), JSON.stringify(recipes));
  }, [recipes, isHydrated, currentUserId]);

  useEffect(() => {
    if (!isHydrated || !currentUserId) return;
    localStorage.setItem(getStorageKey('inventorytrack_batches', currentUserId), JSON.stringify(batches));
  }, [batches, isHydrated, currentUserId]);

  const addMaterial = (material: Omit<Material, 'id' | 'createdAt'>) => {
    setMaterials(prev => [...prev, { ...material, id: generateId(), createdAt: new Date() }]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    setSuppliers(prev => [...prev, { ...supplier, id: generateId(), createdAt: new Date() }]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addStockLog = (log: Omit<StockLog, 'id' | 'createdAt'>) => {
    setStockLogs(prev => [...prev, { ...log, id: generateId(), createdAt: new Date() }]);
  };

  const updateStock = (materialId: string, quantity: number, type: 'add' | 'remove', remarks: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    const newQuantity = type === 'add' 
      ? material.quantity + quantity 
      : Math.max(0, material.quantity - quantity);

    updateMaterial(materialId, { quantity: newQuantity });
    addStockLog({
      materialId,
      materialName: material.name,
      type,
      quantity,
      remarks,
    });
  };

  const addRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    setRecipes(prev => [...prev, { ...recipe, id: generateId(), createdAt: new Date() }]);
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const startBatch = (batch: Omit<ProductionBatch, 'id' | 'createdAt' | 'status'>) => {
    const recipe = recipes.find(r => r.id === batch.recipeId);
    if (!recipe) return;

    // Deduct materials
    recipe.ingredients.forEach(ing => {
      const totalNeeded = ing.quantity * batch.quantity;
      updateStock(ing.materialId, totalNeeded, 'remove', `Used in production: ${batch.recipeName} x${batch.quantity}`);
    });

    setBatches(prev => [...prev, { 
      ...batch, 
      id: generateId(), 
      createdAt: new Date(),
      status: 'ongoing'
    }]);
  };

  const completeBatch = (id: string, actualOutput: number) => {
    setBatches(prev => prev.map(b => {
      if (b.id === id) {
        const wastage = b.estimatedOutput > 0 
          ? ((b.estimatedOutput - actualOutput) / b.estimatedOutput) * 100 
          : 0;
        return {
          ...b,
          status: 'completed' as const,
          actualOutput,
          wastage: Math.max(0, wastage),
          completedAt: new Date()
        };
      }
      return b;
    }));
  };

  const getLowStockMaterials = () => {
    return materials.filter(m => m.quantity <= m.minimumStock);
  };

  const getTotalInventoryValue = () => {
    return materials.reduce((total, m) => total + (m.quantity * m.costPerUnit), 0);
  };

  const clearAppData = () => {
    setMaterials([]);
    setSuppliers([]);
    setStockLogs([]);
    setRecipes([]);
    setBatches([]);
    setCurrentUserId(null);
  };

  return (
    <AppContext.Provider value={{
      materials,
      suppliers,
      stockLogs,
      recipes,
      batches,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addStockLog,
      updateStock,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      startBatch,
      completeBatch,
      getLowStockMaterials,
      getTotalInventoryValue,
      clearAppData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
