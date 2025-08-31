import React from 'react';
import type { LucideProps, LucideIcon } from 'lucide-react';

// Импортируем все иконки из lucide-react для динамического использования
import * as LucideIcons from 'lucide-react';

// Определяем наш собственный тип для пропсов.
// Он будет принимать либо иконку (как компонент), либо имя иконки (как строку),
// и все остальные пропсы, которые можно передать в SVG-иконку.
interface IconProps extends Omit<LucideProps, 'icon'> {
  // `icon` - это компонент иконки из lucide-react (новый API)
  icon?: LucideIcon;
  // `name` - это имя иконки как строка (старый API для обратной совместимости)
  name?: string;
  className?: string;
}

/**
 * Универсальный компонент для отображения иконок из библиотеки lucide-react.
 * Поддерживает как новый API (icon={Component}), так и старый API (name="iconName").
 * Служит оберткой для обеспечения типобезопасности и централизованного управления стилями иконок.
 *
 * @example
 * // Новый API
 * import { Mail } from 'lucide-react';
 * <Icon icon={Mail} size={24} className="text-blue-500" />
 * 
 * // Старый API (для обратной совместимости)
 * <Icon name="mail" size={24} className="text-blue-500" />
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, name, className, size = 16, ...props }, ref) => {
    // Определяем какую иконку использовать
    let IconToRender: LucideIcon | null = null;

    if (IconComponent) {
      // Приоритет новому API
      IconToRender = IconComponent;
    } else if (name) {
      // Старый API - ищем иконку по имени
      const iconName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      // Безопасно получаем иконку из объекта
      const iconFromName = (LucideIcons as any)[iconName];
      if (iconFromName && typeof iconFromName === 'function') {
        IconToRender = iconFromName;
      }
    }

    // Проверяем, что компонент иконки найден
    if (!IconToRender) {
      console.warn(`Icon component not found for name: ${name}`);
      return null;
    }

    // Используем JSX с правильным типизированием
    const RenderedIcon = IconToRender as any;
    return (
      <RenderedIcon
        ref={ref}
        className={className}
        size={size}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';