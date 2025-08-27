import { api } from './index';
import type { Database } from '@my-forum/db-types';

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
