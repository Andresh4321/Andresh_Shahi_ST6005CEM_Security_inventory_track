export interface ProductionItemDTO {
  material: string; // materialId
  quantityUsed: number;
  unit: string;
}

export interface CreateProductionDTO {
  recipeId: string;
  batchQuantity: number;
  estimatedOutput: number;
  actualOutput?: number;
}
