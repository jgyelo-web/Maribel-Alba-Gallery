import axios from 'axios';
import type {
  User,
  Painting,
  CategoryType,
  Category,
  BlogPost,
  SiteContent,
  ContactMessage,
  RestorationRequest,
  RestorationShowcase,
} from '../types/index';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

// Site Content (public)
export const getSiteContent = async (): Promise<SiteContent> => {
  const response = await api.get('/api/site-content');
  return response.data;
};

// Paintings (Admin)
export const getAdminPaintings = async (): Promise<Painting[]> => {
  const response = await api.get('/api/admin/paintings');
  return response.data;
};

export const createPainting = async (data: Partial<Painting>): Promise<{ id: string }> => {
  const response = await api.post('/api/admin/paintings', data);
  return response.data;
};

export const updatePainting = async (id: string, data: Partial<Painting>): Promise<{ message: string }> => {
  const response = await api.put(`/api/admin/paintings/${id}`, data);
  return response.data;
};

export const deletePainting = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/admin/paintings/${id}`);
  return response.data;
};

// Category Types (Admin)
export const getAdminCategoryTypes = async (): Promise<CategoryType[]> => {
  const response = await api.get('/api/admin/category-types');
  return response.data;
};

export const createCategoryType = async (data: { name: string }): Promise<{ id: string }> => {
  const response = await api.post('/api/admin/category-types', data);
  return response.data;
};

export const updateCategoryType = async (id: string, data: { name: string }): Promise<{ message: string }> => {
  const response = await api.put(`/api/admin/category-types/${id}`, data);
  return response.data;
};

export const deleteCategoryType = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/admin/category-types/${id}`);
  return response.data;
};

// Categories (Admin)
export const getAdminCategories = async (): Promise<Category[]> => {
  const response = await api.get('/api/admin/categories');
  return response.data;
};

export const createCategory = async (data: {
  name: string;
  slug: string;
  type_id: string;
}): Promise<{ id: string }> => {
  const response = await api.post('/api/admin/categories', data);
  return response.data;
};

export const updateCategory = async (
  id: string,
  data: { name: string; slug: string; type_id: string }
): Promise<{ message: string }> => {
  const response = await api.put(`/api/admin/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/admin/categories/${id}`);
  return response.data;
};

// Blog Posts (Admin)
export const getAdminBlogPosts = async (): Promise<BlogPost[]> => {
  const response = await api.get('/api/admin/blog-posts');
  return response.data;
};

export const createBlogPost = async (data: Partial<BlogPost>): Promise<{ id: string }> => {
  const response = await api.post('/api/admin/blog-posts', data);
  return response.data;
};

export const updateBlogPost = async (id: string, data: Partial<BlogPost>): Promise<{ message: string }> => {
  const response = await api.put(`/api/admin/blog-posts/${id}`, data);
  return response.data;
};

export const deleteBlogPost = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/admin/blog-posts/${id}`);
  return response.data;
};

// Users (Admin)
export const getAdminUsers = async (): Promise<User[]> => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

export const createUser = async (data: {
  email: string;
  display_name: string;
  role: string;
  password: string;
  avatar_url?: string;
}): Promise<{ id: string }> => {
  const response = await api.post('/api/admin/users', data);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: {
    display_name?: string;
    role?: string;
    avatar_url?: string;
    email_verified?: boolean;
  }
): Promise<{ message: string }> => {
  const response = await api.put(`/api/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/admin/users/${id}`);
  return response.data;
};

// Site Content (Admin)
export const getAdminSiteContent = async (): Promise<SiteContent> => {
  const response = await api.get('/api/admin/site-content');
  return response.data;
};

export const updateSiteContent = async (data: Partial<SiteContent>): Promise<{ message: string }> => {
  const response = await api.put('/api/admin/site-content', data);
  return response.data;
};

// Contact Messages (Admin)
export const getAdminContactMessages = async (): Promise<ContactMessage[]> => {
  const response = await api.get('/api/admin/contact-messages');
  return response.data;
};

export const deleteContactMessage = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/admin/contact-messages/${id}`);
  return response.data;
};

// Contact Messages (Public)
export const createContactMessage = async (data: {
  name: string;
  email: string;
  message: string;
}): Promise<{ id: string }> => {
  const response = await api.post('/api/contact-messages', data);
  return response.data;
};

// Restoration Requests (Admin)
export const getAdminRestorationRequests = async (): Promise<RestorationRequest[]> => {
  const response = await api.get('/api/admin/restoration-requests');
  return response.data;
};

export const updateRestorationRequest = async (
  id: string,
  data: { status?: string; notes?: string }
): Promise<{ message: string }> => {
  const response = await api.put(`/api/admin/restoration-requests/${id}`, data);
  return response.data;
};

export const deleteRestorationRequest = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/admin/restoration-requests/${id}`);
  return response.data;
};

// Restoration Requests (Public)
export const createRestorationRequest = async (data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<{ id: string }> => {
  const response = await api.post('/api/restoration-requests', data);
  return response.data;
};

// Restoration Showcases (Admin)
export const getAdminRestorationShowcases = async (): Promise<RestorationShowcase[]> => {
  const response = await api.get('/api/admin/restoration-showcases');
  return response.data;
};

export const createRestorationShowcase = async (data: Partial<RestorationShowcase>): Promise<{ id: string }> => {
  const response = await api.post('/api/admin/restoration-showcases', data);
  return response.data;
};

export const updateRestorationShowcase = async (
  id: string,
  data: Partial<RestorationShowcase>
): Promise<{ message: string }> => {
  const response = await api.put(`/api/admin/restoration-showcases/${id}`, data);
  return response.data;
};

export const deleteRestorationShowcase = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/admin/restoration-showcases/${id}`);
  return response.data;
};

// File Upload
export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/storage/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;
