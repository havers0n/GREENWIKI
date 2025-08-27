import { api } from './index';
import type { Database, TablesInsert, TablesUpdate } from '@my-forum/db-types';
import { fetchCategories } from './categories';

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

interface SectionItemResponse {
  data: Section | null;
  error?: string;
  deleted?: boolean;
  id?: number;
}

export const createSection = async (
  payload: TablesInsert<'sections'>
): Promise<Section> => {
  try {
    const { data } = await api.post<SectionItemResponse>('/sections', payload);
    if (data.error) throw new Error(data.error);
    if (!data.data) throw new Error('Empty response');
    return data.data;
  } catch (error) {
    console.error('Failed to create section:', error);
    throw error;
  }
};

export const updateSection = async (
  id: number,
  updates: Partial<TablesUpdate<'sections'>>
): Promise<Section> => {
  try {
    const { data } = await api.put<SectionItemResponse>(`/sections/${id}`, updates);
    if (data.error) throw new Error(data.error);
    if (!data.data) throw new Error('Empty response');
    return data.data;
  } catch (error) {
    console.error('Failed to update section:', error);
    throw error;
  }
};

export const deleteSection = async (id: number): Promise<boolean> => {
  try {
    const { data } = await api.delete<SectionItemResponse>(`/sections/${id}`);
    if (data.error) throw new Error(data.error);
    return data.deleted === true;
  } catch (error) {
    console.error('Failed to delete section:', error);
    throw error;
  }
};

export const fetchAllSections = async (): Promise<Section[]> => {
  const categories = await fetchCategories();
  const lists = await Promise.all(categories.map((c) => fetchSectionsByCategoryId(c.id)));
  return lists.flat();
};
