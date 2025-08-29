import { type ClassValue, clsx } from "clsx";

/**
 * Утилита для объединения CSS классов
 * Использует clsx для эффективного объединения условных классов
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Утилита для слияния оригинального контента блока с переопределениями (overrides)
 * Поддерживает вложенные пути через точку (например, 'style.color', 'settings.width')
 *
 * @param originalContent - Оригинальный контент блока
 * @param overrides - Объект с переопределениями
 * @returns Новый объект с примененными переопределениями
 */
export function mergeOverrides(
  originalContent: Record<string, any> | null,
  overrides: Record<string, any> | null
): Record<string, any> {
  if (!originalContent) return overrides || {};
  if (!overrides) return { ...originalContent };

  const result = { ...originalContent };

  for (const [path, value] of Object.entries(overrides)) {
    setNestedProperty(result, path, value);
  }

  return result;
}

/**
 * Устанавливает значение по вложенному пути в объекте
 * @param obj - Объект для изменения
 * @param path - Путь через точку (например, 'style.color')
 * @param value - Значение для установки
 */
export function setNestedProperty(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Получает значение по вложенному пути из объекта
 * @param obj - Объект для чтения
 * @param path - Путь через точку (например, 'style.color')
 * @returns Значение или undefined, если путь не найден
 */
export function getNestedProperty(obj: Record<string, any> | null, path: string): any {
  if (!obj) return undefined;

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!(key in current) || current[key] === null) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Проверяет, есть ли переопределение для данного пути
 * @param overrides - Объект с переопределениями
 * @param path - Путь через точку
 * @returns true, если переопределение существует
 */
export function hasOverride(overrides: Record<string, any> | null, path: string): boolean {
  if (!overrides) return false;
  return path in overrides;
}

/**
 * Удаляет переопределение для данного пути
 * @param overrides - Объект с переопределениями
 * @param path - Путь через точку
 * @returns Новый объект без указанного переопределения
 */
export function removeOverride(overrides: Record<string, any> | null, path: string): Record<string, any> {
  if (!overrides) return {};

  const result = { ...overrides };
  delete result[path];
  return result;
}