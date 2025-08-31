import { api } from './index';
import type { ReusableBlock, InstantiateReusableBlockRequest } from '../../types/api';

// Типы ответов API
interface ReusableBlocksListResponse {
  data: {
    items: ReusableBlock[];
    count: number;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
  status: 'success' | 'error';
  errors?: string[];
}

interface ReusableBlockResponse {
  success: boolean;
  data: ReusableBlock;
  message?: string;
  error?: string;
}

interface InstantiateResponse {
  success: boolean;
  data: {
    id: string;
    block_type: string;
    content: Record<string, any> | null;
    children: any[]; // Дерево дочерних блоков
  };
  error?: string;
}

// Получение списка переиспользуемых блоков
export const fetchReusableBlocks = async (params: {
  search?: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
} = {}): Promise<ReusableBlocksListResponse> => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await api.get<ReusableBlocksListResponse>(`/reusable-blocks?${queryParams.toString()}`);
  return response.data;
};

// Получение одного переиспользуемого блока по ID
export const fetchReusableBlock = async (id: string): Promise<ReusableBlock> => {
  const response = await api.get<ReusableBlockResponse>(`/reusable-blocks/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch reusable block');
  }

  return response.data.data;
};

// Создание экземпляра переиспользуемого блока
export const instantiateReusableBlock = async (
  params: InstantiateReusableBlockRequest
): Promise<any> => {
  const response = await api.post<InstantiateResponse>(
    `/reusable-blocks/${params.reusableBlockId}/instantiate`,
    params
  );

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to instantiate reusable block');
  }

  return response.data.data;
};

// Создание нового переиспользуемого блока (только для админов)
export const createReusableBlock = async (params: {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  sourceBlockIds: string[];
  rootBlockId: string;
}): Promise<ReusableBlock> => {
  const response = await api.post<ReusableBlockResponse>('/reusable-blocks', params);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to create reusable block');
  }

  return response.data.data;
};

// Обновление метаданных переиспользуемого блока (только для админов)
export const updateReusableBlock = async (
  id: string,
  params: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
  }
): Promise<ReusableBlock> => {
  const response = await api.put<ReusableBlockResponse>(`/reusable-blocks/${id}`, params);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to update reusable block');
  }

  return response.data.data;
};

// Удаление переиспользуемого блока (только для админов)
export const deleteReusableBlock = async (id: string): Promise<void> => {
  const response = await api.delete(`/reusable-blocks/${id}`);

  if (response.status !== 200) {
    throw new Error('Failed to delete reusable block');
  }
};
