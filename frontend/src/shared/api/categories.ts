import { api } from './index';
import type { Database, TablesInsert, TablesUpdate } from '@my-forum/db-types';

type Category = Database['public']['Tables']['categories']['Row'];

export interface CategoriesResponse {
  data: Category[] | null;
  error?: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<CategoriesResponse>('/categories');
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

interface CategoryItemResponse {
  data: Category | null;
  error?: string;
  deleted?: boolean;
  id?: number;
}

export const createCategory = async (
  payload: TablesInsert<'categories'>
): Promise<Category> => {
  try {
    const { data } = await api.post<CategoryItemResponse>('/categories', payload);
    if (data.error) throw new Error(data.error);
    if (!data.data) throw new Error('Empty response');
    return data.data;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  updates: Partial<TablesUpdate<'categories'>>
): Promise<Category> => {
  try {
    const { data } = await api.put<CategoryItemResponse>(`/categories/${id}`, updates);
    if (data.error) throw new Error(data.error);
    if (!data.data) throw new Error('Empty response');
    return data.data;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const { data } = await api.delete<CategoryItemResponse>(`/categories/${id}`);
    if (data.error) throw new Error(data.error);
    return data.deleted === true;
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
};
