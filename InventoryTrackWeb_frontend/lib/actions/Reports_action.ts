"use server";
import { stockAPI, productionAPI, materialsAPI } from '../api/endpoints';

export const getReportsDataAction = async () => {
  try {
    const [transactions, productions, materials] = await Promise.all([
      stockAPI.getTransactions(),
      productionAPI.getAll(),
      materialsAPI.getAll(),
    ]);

    return {
      success: true,
      data: {
        transactions: transactions.data.data,
        productions: productions.data.data,
        materials: materials.data.data,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch reports' };
  }
};
