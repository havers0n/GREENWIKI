import { api } from './index';

// Типы для работы с переопределениями блоков
export interface BlockOverrides {
  [path: string]: any;
}

export interface UpdateOverridesRequest {
  overrides: BlockOverrides;
}

export interface BlockInstanceResponse {
  success: boolean;
  data: {
    id: string;
    overrides: BlockOverrides;
    updated_at: string;
  };
  error?: string;
}

// Получение переопределений для экземпляра блока
export const getBlockInstanceOverrides = async (instanceId: string): Promise<BlockOverrides> => {
  const response = await api.get<BlockInstanceResponse>(`/api/block-instances/${instanceId}/overrides`);

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch block instance overrides');
  }

  return response.data.data.overrides || {};
};

// Обновление переопределений для экземпляра блока
export const updateBlockInstanceOverrides = async (
  instanceId: string,
  overrides: BlockOverrides
): Promise<BlockOverrides> => {
  const response = await api.put<BlockInstanceResponse>(
    `/api/block-instances/${instanceId}/overrides`,
    { overrides }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to update block instance overrides');
  }

  return response.data.data.overrides || {};
};

// Установка одного переопределения
export const setBlockInstanceOverride = async (
  instanceId: string,
  path: string,
  value: any
): Promise<BlockOverrides> => {
  const currentOverrides = await getBlockInstanceOverrides(instanceId);
  const newOverrides = { ...currentOverrides, [path]: value };

  return updateBlockInstanceOverrides(instanceId, newOverrides);
};

// Удаление переопределения
export const removeBlockInstanceOverride = async (
  instanceId: string,
  path: string
): Promise<BlockOverrides> => {
  const currentOverrides = await getBlockInstanceOverrides(instanceId);
  const newOverrides = { ...currentOverrides };
  delete newOverrides[path];

  return updateBlockInstanceOverrides(instanceId, newOverrides);
};

// Очистка всех переопределений
export const clearBlockInstanceOverrides = async (instanceId: string): Promise<BlockOverrides> => {
  return updateBlockInstanceOverrides(instanceId, {});
};
