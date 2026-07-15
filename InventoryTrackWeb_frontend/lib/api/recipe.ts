import apiClient from './client';

export const recipeAPI = {
  create: (data: any) => apiClient.post('/recipes', data),
  getAll: () => apiClient.get('/recipes'),
  getById: (id: string) => apiClient.get(`/recipes/${id}`),
  update: (id: string, data: any) => apiClient.put(`/recipes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/recipes/${id}`),
};
