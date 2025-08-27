import { api } from './index';
import type { Database } from '@my-forum/db-types';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

export interface LayoutBlockResponse {
  data: LayoutBlock[] | null;
  error?: string;
}

export const fetchLayoutByPage = async (pageIdentifier: string): Promise<LayoutBlock[]> => {
  try {
    const response = await api.get<LayoutBlockResponse>(`/layout/${pageIdentifier}`);
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch layout:', error);
    throw error;
  }
};
