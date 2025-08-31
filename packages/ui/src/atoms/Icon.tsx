import React from 'react';
import type { LucideProps } from 'lucide-react';

// Определяем наш собственный тип для пропсов.
// Он будет принимать саму иконку (как компонент) и все остальные пропсы,
// которые можно передать в SVG-иконку (цвет, размер и т.д.).
interface IconProps extends LucideProps {
  // `icon` - это не строка и не объект, а сам React-компонент иконки.
  // `React.ElementType` - это общий тип для React-компонентов.
  icon: React.ElementType;
  className?: string;
}

/**
 * Универсальный компонент для отображения иконок из библиотеки lucide-react.
 * Он служит оберткой для обеспечения типобезопасности и централизованного управления стилями иконок.
 *
 * @example
 * import { Mail } from 'lucide-react';
 * <Icon icon={Mail} size={24} className="text-blue-500" />
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, className, size = 16, ...props }, ref) => {
    // Проверяем, что компонент иконки вообще был передан.
    if (!IconComponent) {
      return null;
    }

    return (
      <IconComponent
        ref={ref}
        className={className}
        size={size}
        // Передаем остальные пропсы (например, color, strokeWidth)
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';