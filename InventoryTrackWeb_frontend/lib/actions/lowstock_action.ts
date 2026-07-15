"use server";
import { materialsAPI } from '../api/endpoints';

export const getLowStockMaterialsAction = async () => {
  try {
    const response = await materialsAPI.getAll();
    // Filter materials that are below minimum stock
    const materials = response.data.data || [];
    const lowStock = materials.filter((m: any) => m.quantity < m.minimum_stock);
    return { success: true, data: lowStock };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch low stock materials' };
  }
};
