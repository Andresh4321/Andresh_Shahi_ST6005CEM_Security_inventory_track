import apiClient from './client';

// ==================== AUTH ENDPOINTS ==================== 

// ==================== MATERIALS ENDPOINTS ====================
export const materialsAPI = {
  create: (data: any) => apiClient.post('/materials', data),
  getAll: () => apiClient.get('/materials'),
  getById: (id: string) => apiClient.get(`/materials/${id}`),
  update: (id: string, data: any) => apiClient.put(`/materials/${id}`, data),
  delete: (id: string) => apiClient.delete(`/materials/${id}`),
};

// ==================== STOCK ENDPOINTS ====================
export const stockAPI = {
  createTransaction: (data: any) => apiClient.post('/stock', data),
  getTransactions: () => apiClient.get('/stock'),
  getCurrentStock: () => apiClient.get('/stock/current'),
  getById: (id: string) => apiClient.get(`/stock/${id}`),
  update: (id: string, data: any) => apiClient.put(`/stock/${id}`, data),
  delete: (id: string) => apiClient.delete(`/stock/${id}`),
};

// ==================== BILL OF MATERIALS ENDPOINTS ====================
export const billOfMaterialsAPI = {
  getAll: () => apiClient.get('/bill-of-materials'),
  create: (data: any) => apiClient.post('/bill-of-materials', data),
  changePrice: (id: string, price: number) =>
    apiClient.put(`/bill-of-materials/${id}/price`, { price }),
  delete: (id: string) => apiClient.delete(`/bill-of-materials/${id}`),
};

// ==================== RECIPES ENDPOINTS ====================
export const recipesAPI = {
  create: (data: any) => apiClient.post('/recipes', data),
  getAll: () => apiClient.get('/recipes'),
  getById: (id: string) => apiClient.get(`/recipes/${id}`),
  update: (id: string, data: any) => apiClient.put(`/recipes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/recipes/${id}`),
};

// ==================== PRODUCTION ENDPOINTS ====================
export const productionAPI = {
  create: (data: any) => apiClient.post('/production', data),
  getAll: () => apiClient.get('/production'),
  getById: (id: string) => apiClient.get(`/production/${id}`),
  complete: (id: string, actualOutput: number) =>
    apiClient.put(`/production/${id}/complete`, { actualOutput }),
  delete: (id: string) => apiClient.delete(`/production/${id}`),
};

// ==================== SUPPLIERS ENDPOINTS ====================
export const suppliersAPI = {
  create: (data: any) => apiClient.post('/suppliers', data),
  getAll: () => apiClient.get('/suppliers'),
  getById: (id: string) => apiClient.get(`/suppliers/${id}`),
  update: (id: string, data: any) => apiClient.put(`/suppliers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/suppliers/${id}`),
  getByProduct: (product: string) => apiClient.get(`/suppliers/by-product/search?product=${encodeURIComponent(product)}`),
};

// ==================== MESSAGING ENDPOINTS ====================
export const messagingAPI = {
  checkUserExists: (email: string) => apiClient.post('/messages/check-user', { email }),
  getOrCreateConversation: (receiverEmail: string) => 
    apiClient.post('/messages/conversation', { receiverEmail }),
  sendMessage: (data: any) => apiClient.post('/messages/send', data),
  getConversation: (conversationId: string) => apiClient.get(`/messages/${conversationId}`),
  getConversationsList: () => apiClient.get('/messages'),
  getUnreadCount: () => apiClient.get('/messages/count/unread'),
};

// ==================== ADMIN ENDPOINTS ====================
export const adminAPI = {
  getAllUsers: (page?: number, limit?: number) =>
    apiClient.get('/admin/users', { params: { page, limit } }),
  createUser: (data: any) => apiClient.post('/admin/users', data),
  getUserById: (id: string) => apiClient.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
};

// Legacy API export for backward compatibility
export const API = {
   AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        GET_USER: (id: string) => `/api/auth/${id}`,
        UPDATE_USER: (id: string) => `/api/auth/${id}`,
        FORGOT_PASSWORD: '/api/auth/forgot-password', 
        RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
    },
    ADMIN: {
        ADMINLOGIN: '/api/auth/admin/login',
        ADMIN: '/api/admin/users',
        SEARCH_PHONE: (phone: string) => `/api/admin/users/search?phone=${phone}`,
        GET_USER: (id: string) => `/api/admin/users/${id}`,
        UPDATE_USER: (id: string) => `/api/admin/users/${id}`,
        UPDATE_IMAGE: (id: string) => `/api/admin/users/${id}/image`,
        DELETE_USER: (id: string) => `/api/admin/users/${id}`,
        CREATE_USER: () => '/api/admin/users',
    }  
};
