export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface TodoRequest {
  title: string;
  description?: string;
  completed?: boolean;
  priority: Priority;
  dueDate?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TodoQueryParams {
  search?: string;
  status?: string; // 'ALL' | 'PENDING' | 'COMPLETED'
  priority?: string; // 'LOW' | 'MEDIUM' | 'HIGH'
  page?: number;
  size?: number;
  sortBy?: string; // 'createdAt' | 'dueDate' | 'priority' | 'title'
  sortDirection?: 'asc' | 'desc';
}
