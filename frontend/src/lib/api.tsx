import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  signUp: (name: string, email: string, password: string) =>
    api.post('/auth/signup', { name, email, password }),
};

export const userAPI = {
  getProfile: () => api.get('/auth/profile'),
};
export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (product: any) => api.post('/products', product),
  update: (id: string, product: any) => api.put(`/products/${id}`, product),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId: string, quantity: number) => 
    api.post('/cart/items', { productId, quantity }),
  updateItem: (productId: string, quantity: number) => 
    api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId: string) => 
    api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
};

export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (orderData: any) => api.post('/orders', orderData),
  updateStatus: (id: string, status: string) => 
    api.put(`/orders/${id}/status`, { status }),
};

// Wishlist API calls
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  addItem: (productId: string) => api.post('/wishlist/items', { productId }),
  removeItem: (productId: string) => api.delete(`/wishlist/items/${productId}`),
  clear: () => api.delete('/wishlist'),
  check: (productId: string) => api.get(`/wishlist/check/${productId}`),
};

export default api;
