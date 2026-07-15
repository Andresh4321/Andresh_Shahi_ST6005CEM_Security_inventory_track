import apiClient from './client';

export const productionAPI = {
  create: (data: any) => apiClient.post('/production', data),
  getAll: () => apiClient.get('/production'),
  getById: (id: string) => apiClient.get(`/production/${id}`),
  complete: (id: string, data: any) => apiClient.put(`/production/${id}/complete`, data),
  delete: (id: string) => apiClient.delete(`/production/${id}`),
};
