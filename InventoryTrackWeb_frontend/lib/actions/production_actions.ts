import { productionAPI } from '../api/production';
import { recipeAPI } from '../api/recipe';

export const createProductionAction = async (formData: any) => {
  try {
    const payload = {
      recipeId: formData.recipeId,
      batchQuantity: formData.quantity,
      estimatedOutput: formData.estimatedOutput,
      actualOutput: formData.actualOutput,
    };
    const response = await productionAPI.create(payload);
    return { success: true, data: response.data, message: "Production batch created successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to create production' };
  }
};

export const getProductionsAction = async () => {
  try {
    const response = await productionAPI.getAll();
    return { success: true, data: response.data.data || response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch productions' };
  }
};

export const getProductionByIdAction = async (id: string) => {
  try {
    const response = await productionAPI.getById(id);
    return { success: true, data: response.data.data || response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch production' };
  }
};

export const completeProductionAction = async (id: string, actualOutput: number) => {
  try {
    const response = await productionAPI.complete(id, { actualOutput });
    return { success: true, data: response.data, message: "Production batch completed successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to complete production' };
  }
};

export const deleteProductionAction = async (id: string) => {
  try {
    await productionAPI.delete(id);
    return { success: true, message: "Production deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to delete production' };
  }
};

export const createRecipeAction = async (formData: any) => {
  try {
    const response = await recipeAPI.create(formData);
    return { success: true, data: response.data, message: "Recipe created successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to create recipe' };
  }
};

export const getRecipesAction = async () => {
  try {
    const response = await recipeAPI.getAll();
    return { success: true, data: response.data.data || response.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch recipes' };
  }
};

export const deleteRecipeAction = async (id: string) => {
  try {
    await recipeAPI.delete(id);
    return { success: true, message: "Recipe deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to delete recipe' };
  }
};
