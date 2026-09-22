import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { HealthResponse } from '../types/health';
import { Todo, TodoRequest, PageResponse, TodoQueryParams } from '../types/todo';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('todo_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling and 401 expiration handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('todo_auth_token');
      localStorage.removeItem('todo_auth_user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    let errorMessage = 'Network error or backend server is unreachable';
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as Record<string, unknown>;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors.join(', ');
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (typeof data.error === 'string') {
        errorMessage = data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

export const todoService = {
  getAll: async (params?: TodoQueryParams): Promise<PageResponse<Todo>> => {
    const response = await apiClient.get<PageResponse<Todo>>('/todos', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Todo> => {
    const response = await apiClient.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  create: async (data: TodoRequest): Promise<Todo> => {
    const response = await apiClient.post<Todo>('/todos', data);
    return response.data;
  },

  update: async (id: number, data: TodoRequest): Promise<Todo> => {
    const response = await apiClient.put<Todo>(`/todos/${id}`, data);
    return response.data;
  },

  toggleComplete: async (id: number): Promise<Todo> => {
    const response = await apiClient.patch<Todo>(`/todos/${id}/complete`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },
};

export const healthService = {
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};

export default apiClient;
