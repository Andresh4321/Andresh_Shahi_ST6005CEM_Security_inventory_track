"use server";
import { stockAPI } from '../api/endpoints';

export const createStockTransactionAction = async (formData: any) => {
  try {
    const response = await stockAPI.createTransaction(formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to create transaction' };
  }
};

export const getStockTransactionsAction = async () => {
  try {
    const response = await stockAPI.getTransactions();
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch transactions' };
  }
};

export const getCurrentStockAction = async () => {
  try {
    const response = await stockAPI.getCurrentStock();
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch stock' };
  }
};

export const getStockTransactionByIdAction = async (id: string) => {
  try {
    const response = await stockAPI.getById(id);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch transaction' };
  }
};

export const updateStockTransactionAction = async (id: string, formData: any) => {
  try {
    const response = await stockAPI.update(id, formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to update transaction' };
  }
};

export const deleteStockTransactionAction = async (id: string) => {
  try {
    await stockAPI.delete(id);
    return { success: true, message: "Stock transaction deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to delete transaction' };
  }
};
