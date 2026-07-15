export interface Material {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  costPerUnit: number;
  minimumStock: number;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
  products: string[];
  prices: Record<string, number>;
  isFavorite: boolean;
  createdAt: Date;
}

export interface StockLog {
  id: string;
  materialId: string;
  materialName: string;
  type: 'add' | 'remove';
  quantity: number;
  remarks: string;
  createdAt: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  price: number;
  ingredients: RecipeIngredient[];
  createdAt: Date;
}

export interface RecipeIngredient {
  materialId: string;
  materialName: string;
  quantity: number;
}

export interface ProductionBatch {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  status: 'ongoing' | 'completed';
  estimatedOutput: number;
  actualOutput?: number;
  wastage?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface DashboardStats {
  totalMaterials: number;
  lowStockItems: number;
  totalInventoryValue: number;
  activeBatches: number;
  todayProduction: number;
  avgWastage: number;
}
