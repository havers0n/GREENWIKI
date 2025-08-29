import { api } from './index';
import { supabase } from '../../supabase';

const getAuthHeader = async (): Promise<Record<string, string>> => {
  try {
    const { data } = await supabase.auth.getSession();
    const token = (data as any)?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export interface PageTemplate {
  id: string;
  title: string;
  description: string | null;
  preview_url: string | null;
  blocks: unknown[];
  created_by: string | null;
  created_at: string;
}

export interface TemplatesListResponse {
  data: PageTemplate[];
  error?: string;
}

export interface TemplateSingleResponse {
  data: PageTemplate | null;
  error?: string;
  details?: string;
}

export const fetchTemplates = async (): Promise<PageTemplate[]> => {
  const headers = await getAuthHeader();
  const res = await api.get<TemplatesListResponse>(`/templates`, { headers });
  if (res.data.error) throw new Error(res.data.error);
  return res.data.data || [];
};

export const createTemplate = async (payload: {
  title: string;
  description?: string | null;
  preview_url?: string | null;
  blocks: unknown[];
}): Promise<PageTemplate> => {
  const headers = await getAuthHeader();
  const res = await api.post<TemplateSingleResponse>(`/templates`, payload, { headers });
  if (res.data.error || !res.data.data) throw new Error(res.data.details || res.data.error || 'Failed to create template');
  return res.data.data;
};

export const fetchTemplateById = async (id: string): Promise<PageTemplate> => {
  const headers = await getAuthHeader();
  const res = await api.get<TemplateSingleResponse>(`/templates/${id}`, { headers });
  if (res.data.error || !res.data.data) throw new Error(res.data.error || 'Template not found');
  return res.data.data;
};
