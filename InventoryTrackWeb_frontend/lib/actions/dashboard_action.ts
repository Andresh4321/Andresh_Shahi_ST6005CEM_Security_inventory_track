"use server";
import { materialsAPI, stockAPI, productionAPI, billOfMaterialsAPI } from '../api/endpoints';

export const getDashboardDataAction = async () => {
  try {
    const [materialsRes, stockRes, productionsRes, billRes] = await Promise.all([
      materialsAPI.getAll(),
      stockAPI.getTransactions(),
      productionAPI.getAll(),
      billOfMaterialsAPI.getAll(),
    ]);

    return {
      success: true,
      data: {
        materials: materialsRes.data.data,
        stock: stockRes.data.data,
        productions: productionsRes.data.data,
        bill: billRes.data.data,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch dashboard data' };
  }
};
