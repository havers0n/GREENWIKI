import { api } from './index';
import type { Database, TablesInsert, TablesUpdate } from '@my-forum/db-types';
import { supabase } from '../../supabase';

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

// Admin API
interface SingleLayoutBlockResponse {
  data: LayoutBlock | null;
  error?: string;
  details?: string;
}

interface DeleteBlockResponse {
  deleted: boolean;
  id?: string;
  error?: string;
  details?: string;
}

const getAuthHeader = async (): Promise<Record<string, string>> => {
  try {
    const { data } = await supabase.auth.getSession();
    const token = (data as any)?.session?.access_token;
    console.log('Auth header token:', token ? 'present' : 'missing');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    console.log('Error getting auth header:', error);
    return {};
  }
};

export const fetchAdminLayoutByPage = async (pageIdentifier: string): Promise<LayoutBlock[]> => {
  const headers = await getAuthHeader();
  const res = await api.get<LayoutBlockResponse>(`/layout/admin/${pageIdentifier}`, { headers });
  if (res.data.error) throw new Error(res.data.error);
  return res.data.data || [];
};

export const createLayoutBlock = async (payload: TablesInsert<'layout_blocks'>): Promise<LayoutBlock> => {
  const headers = await getAuthHeader();
  console.log('API: Creating layout block with payload:', payload);
  console.log('API: Headers:', headers);

  try {
    const res = await api.post<SingleLayoutBlockResponse>(`/layout`, payload, { headers });
    console.log('API: Response:', res.data);

    if (res.data.error) {
      console.error('API: Error response:', res.data);
      throw new Error(res.data.details || res.data.error);
    }

    if (!res.data.data) {
      console.error('API: Empty response data');
      throw new Error('Empty response when creating layout block');
    }

    return res.data.data;
  } catch (error) {
    console.error('API: createLayoutBlock failed:', error);
    throw error;
  }
};

export const updateLayoutBlock = async (
  blockId: string,
  updates: Partial<TablesUpdate<'layout_blocks'>>
): Promise<LayoutBlock> => {
  const headers = await getAuthHeader();
  const res = await api.put<SingleLayoutBlockResponse>(`/layout/${blockId}`, updates, { headers });
  if (res.data.error) throw new Error(res.data.details || res.data.error);
  if (!res.data.data) throw new Error('Empty response when updating layout block');
  return res.data.data;
};

export const deleteLayoutBlock = async (blockId: string): Promise<boolean> => {
  const headers = await getAuthHeader();
  const res = await api.delete<DeleteBlockResponse>(`/layout/${blockId}`, { headers });
  if (res.data.error) throw new Error(res.data.details || res.data.error);
  return !!res.data.deleted;
};

export const updateLayoutPositions = async (
  updates: Array<{ id: string; position: number }>
): Promise<void> => {
  const headers = await getAuthHeader();
  try {
    // Предпочтительно — один bulk-запрос
    await api.put(`/layout/positions`, updates, { headers });
    return;
  } catch (bulkError) {
    // Фолбэк — поштучные обновления (как раньше)
    const results = await Promise.allSettled(
      updates.map(({ id, position }) => api.put(`/layout/${id}`, { position }, { headers }))
    );
    const failures = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
    if (failures.length > 0) {
      throw new Error(`Failed to update positions for ${failures.length} block(s)`);
    }
  }
};

export interface LayoutRevisionsListResponse {
  data: Array<{ id: string; page_identifier: string; snapshot: unknown; created_by: string | null; created_at: string }>|null;
  error?: string;
}

export const createLayoutRevision = async (pageIdentifier: string): Promise<void> => {
  const headers = await getAuthHeader();
  await api.post(`/layout/${pageIdentifier}/revisions`, {}, { headers });
};

export const fetchLayoutRevisions = async (pageIdentifier: string) => {
  const headers = await getAuthHeader();
  const res = await api.get<LayoutRevisionsListResponse>(`/layout/${pageIdentifier}/revisions`, { headers });
  if (res.data.error) throw new Error(res.data.error);
  return res.data.data || [];
};

export const revertToLayoutRevision = async (pageIdentifier: string, revisionId: string): Promise<void> => {
  const headers = await getAuthHeader();
  await api.post(`/layout/${pageIdentifier}/revisions/${revisionId}/revert`, {}, { headers });
};
