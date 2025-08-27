import { api } from './index';
import type { Database, TablesInsert, TablesUpdate } from '@my-forum/db-types';
import { supabase } from '../../supabase';

// Типы
export type PageRow = Database['public']['Tables']['pages']['Row'];

interface PagesListResponse {
  data: PageRow[] | null;
  error?: string;
}

interface PageItemResponse {
  data: PageRow | null;
  error?: string;
  deleted?: boolean;
  id?: number;
}

const getAuthHeader = async (): Promise<Record<string, string>> => {
  try {
    const { data } = await supabase.auth.getSession();
    const token = (data as any)?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

// Публичный список опубликованных страниц
export const fetchPublishedPages = async (): Promise<PageRow[]> => {
  const res = await api.get<PagesListResponse>('/pages');
  if (res.data.error) throw new Error(res.data.error);
  return res.data.data || [];
};

// Админский список всех страниц (включая черновики)
export const fetchAdminPages = async (): Promise<PageRow[]> => {
  const headers = await getAuthHeader();
  const res = await api.get<PagesListResponse>('/pages/admin', { headers });
  if (res.data.error) throw new Error(res.data.error);
  return res.data.data || [];
};

export const createPage = async (payload: TablesInsert<'pages'>): Promise<PageRow> => {
  const headers = await getAuthHeader();
  const { data } = await api.post<PageItemResponse>('/pages', payload, { headers });
  if (data.error) throw new Error(data.error);
  if (!data.data) throw new Error('Empty response');
  return data.data;
};

export const updatePage = async (
  id: number,
  updates: Partial<TablesUpdate<'pages'>>,
): Promise<PageRow> => {
  const headers = await getAuthHeader();
  const { data } = await api.put<PageItemResponse>(`/pages/${id}`, updates, { headers });
  if (data.error) throw new Error(data.error);
  if (!data.data) throw new Error('Empty response');
  return data.data;
};

export const deletePage = async (id: number): Promise<boolean> => {
  const headers = await getAuthHeader();
  const { data } = await api.delete<PageItemResponse>(`/pages/${id}`, { headers });
  if (data.error) throw new Error(data.error);
  return data.deleted === true;
};
