/**
 * Защитники типов (Type Guards) для безопасной работы с данными
 * Предотвращают ошибки рантайма при работе с potentially unsafe данными
 */

/**
 * Проверяет, что metadata содержит поле position типа number
 */
interface MetadataWithPosition {
  position: number;
}

export const hasPosition = (metadata: any): metadata is MetadataWithPosition => {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata) && typeof metadata.position === 'number';
};

/**
 * Проверяет, что metadata содержит поле parentBlockId типа string
 */
interface MetadataWithParentId {
  parentBlockId: string | null;
}

export const hasParentId = (metadata: any): metadata is MetadataWithParentId => {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata) &&
         (typeof metadata.parentBlockId === 'string' || metadata.parentBlockId === null);
};

/**
 * Проверяет, что metadata содержит поле spacing
 */
interface MetadataWithSpacing {
  spacing: {
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
  };
}

export const hasSpacing = (metadata: any): metadata is MetadataWithSpacing => {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata) &&
         metadata.spacing && typeof metadata.spacing === 'object';
};

/**
 * Проверяет, что значение является непустой строкой
 */
export const isNonEmptyString = (value: any): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Проверяет, что значение является объектом (не массивом, не null)
 */
export const isObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Безопасно извлекает строковое значение из объекта
 */
export const safeStringValue = (obj: any, key: string, defaultValue: string = ''): string => {
  if (!isObject(obj)) return defaultValue;
  const value = obj[key];
  return typeof value === 'string' ? value : defaultValue;
};

/**
 * Безопасно извлекает числовое значение из объекта
 */
export const safeNumberValue = (obj: any, key: string, defaultValue: number = 0): number => {
  if (!isObject(obj)) return defaultValue;
  const value = obj[key];
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
};
