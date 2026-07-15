"use server";
import { recipesAPI } from '../api/endpoints';

export const createRecipeAction = async (formData: any) => {
  try {
    const response = await recipesAPI.create(formData);
    return { success: true, data: response.data, message: "Recipe created successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to create recipe' };
  }
};

export const getRecipesAction = async () => {
  try {
    const response = await recipesAPI.getAll();
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch recipes' };
  }
};

export const getRecipeByIdAction = async (id: string) => {
  try {
    const response = await recipesAPI.getById(id);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to fetch recipe' };
  }
};

export const updateRecipeAction = async (id: string, formData: any) => {
  try {
    const response = await recipesAPI.update(id, formData);
    return { success: true, data: response.data, message: "Recipe updated successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to update recipe' };
  }
};

export const deleteRecipeAction = async (id: string) => {
  try {
    await recipesAPI.delete(id);
    return { success: true, message: "Recipe deleted successfully" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to delete recipe' };
  }
};
