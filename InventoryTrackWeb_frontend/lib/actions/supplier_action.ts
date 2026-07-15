
"use server";
import { suppliersAPI } from '../api/endpoints';

export const createSupplierAction = async (formData: any) => {
  try {
    const response = await suppliersAPI.create(formData);
    return { success: true, data: response.data, message: "Supplier created successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to create supplier' };
  }
};

export const getSupplierAction = async (id: string) => {
  try {
    const response = await suppliersAPI.getById(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch supplier' };
  }
};

export const getSuppliersAction = async () => {
  try {
    const response = await suppliersAPI.getAll();
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch suppliers' };
  }
};

export const updateSupplierAction = async (id: string, formData: any) => {
  try {
    const response = await suppliersAPI.update(id, formData);
    return { success: true, data: response.data, message: "Supplier updated successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to update supplier' };
  }
};

export const deleteSupplierAction = async (id: string) => {
  try {
    await suppliersAPI.delete(id);
    return { success: true, message: "Supplier deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to delete supplier' };
  }
};

export const handleSupplierAction = async (formData: any) => {
    try {
        const result = await createSupplierAction(formData);
        if (result.success) {
            return {
                success: true,
                message: "Supplier adding successful",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.error || "Supplier add failed"
        };
    } catch (err: Error | any) {
        return {
            success: false, 
            message: err.message || "Supplier add failed"
        };
    }
};
