import { api } from './index';
import type { Database } from '@my-forum/db-types';

type Section = Database['public']['Tables']['sections']['Row'];

export interface SectionsResponse {
  data: Section[] | null;
  error?: string;
}

export const fetchSectionsByCategoryId = async (categoryId: number): Promise<Section[]> => {
  try {
    const response = await api.get<SectionsResponse>(`/sections/by-category/${categoryId}`);
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    throw error;
  }
};
