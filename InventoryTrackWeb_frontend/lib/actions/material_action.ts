"use server";
import { materialsAPI } from '../api/endpoints';

export const createMaterialAction = async (formData: any) => {
  try {
    const response = await materialsAPI.create(formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to create material' };
  }
};

export const getMaterialsAction = async () => {
  try {
    const response = await materialsAPI.getAll();
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch materials' };
  }
};

export const getMaterialByIdAction = async (id: string) => {
  try {
    const response = await materialsAPI.getById(id);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch material' };
  }
};

export const updateMaterialAction = async (id: string, formData: any) => {
  try {
    const response = await materialsAPI.update(id, formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to update material' };
  }
};

export const deleteMaterialAction = async (id: string) => {
  try {
    await materialsAPI.delete(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to delete material' };
  }
};
