"use server";
import { billOfMaterialsAPI } from '../api/endpoints';

export const createBillItemAction = async (formData: any) => {
  try {
    const response = await billOfMaterialsAPI.create(formData);
    return { success: true, data: response.data, message: "Bill item created successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to create bill item' };
  }
};

export const getBillOfMaterialsAction = async () => {
  try {
    const response = await billOfMaterialsAPI.getAll();
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch bill of materials' };
  }
};

export const changePriceAction = async (id: string, price: number) => {
  try {
    await billOfMaterialsAPI.changePrice(id, price);
    return { success: true, message: "Price updated successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to update price' };
  }
};

export const deleteBillItemAction = async (id: string) => {
  try {
    await billOfMaterialsAPI.delete(id);
    return { success: true, message: "Bill item deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to delete bill item' };
  }
};
