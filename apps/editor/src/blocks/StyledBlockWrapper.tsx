import React from 'react';
import { useComputedStyles, useBlockComputedStyles } from '../store/hooks/designSystemHooks';
import type { BlockNode } from '@my-forum/model';

/**
 * StyledBlockWrapper - обертка для блоков с поддержкой StylePropagationEngine
 *
 * Этот компонент демонстрирует интеграцию новой системы стилей с существующей
 * архитектурой блоков. Он автоматически применяет вычисленные стили к любому блоку.
 */

interface StyledBlockWrapperProps {
  block: BlockNode;
  blockId?: string; // ID конкретного блока внутри компонента (опционально)
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; // Дополнительные стили (для backward compatibility)
}

/**
 * StyledBlockWrapper для применения стилей ко всему компоненту
 *
 * Используется для блоков, которые являются экземплярами переиспользуемых компонентов
 * и требуют применения всех вычисленных стилей сразу.
 */
export const StyledBlockWrapper: React.FC<StyledBlockWrapperProps> = ({
  block,
  children,
  className,
  style = {},
}) => {
  // Получаем все вычисленные стили для экземпляра
  const computedStyles = useComputedStyles(block.id);

  // Если блок не является экземпляром или стили не найдены, возвращаем без изменений
  if (!block.instance_id || Object.keys(computedStyles).length === 0) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  // Создаем итоговые стили (computed styles имеют высший приоритет)
  const finalStyles = {
    ...style,
    ...computedStyles,
  };

  return (
    <div
      className={className}
      style={finalStyles}
      data-instance-id={block.instance_id}
      data-block-id={block.id}
    >
      {children}
    </div>
  );
};

/**
 * StyledBlock для применения стилей к конкретному блоку внутри компонента
 *
 * Используется когда нужно применить стили только к определенному блоку
 * внутри переиспользуемого компонента.
 */
interface StyledBlockProps {
  instanceId: string;
  blockId: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StyledBlock: React.FC<StyledBlockProps> = ({
  instanceId,
  blockId,
  children,
  className,
  style = {},
}) => {
  // Получаем стили только для конкретного блока
  const blockStyles = useBlockComputedStyles(instanceId, blockId);

  // Создаем итоговые стили
  const finalStyles = {
    ...style,
    ...blockStyles,
  };

  return (
    <div
      className={className}
      style={finalStyles}
      data-block-id={blockId}
      data-instance-id={instanceId}
    >
      {children}
    </div>
  );
};

/**
 * withComputedStyles - HOC для добавления вычисленных стилей к компоненту
 *
 * @param WrappedComponent - компонент, который нужно обернуть
 * @param instanceId - ID экземпляра блока
 * @param blockId - ID блока внутри компонента (опционально)
 */
export function withComputedStyles<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  instanceId: string,
  blockId?: string
) {
  const ComponentWithComputedStyles = React.forwardRef<HTMLElement, P>((props, ref) => {
    // Всегда вызываем оба хука на верхнем уровне
    const stylesFromBlock = useBlockComputedStyles(instanceId, blockId || '');
    const stylesFromInstance = useComputedStyles(instanceId);

    // Используем условную логику для выбора стилей
    const computedStyles = React.useMemo(() => {
      return blockId ? stylesFromBlock : stylesFromInstance;
    }, [blockId, stylesFromBlock, stylesFromInstance]);

    return (
      <WrappedComponent
        {...(props as P)}
        ref={ref}
        computedStyles={computedStyles}
      />
    );
  });

  ComponentWithComputedStyles.displayName = `WithComputedStyles(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithComputedStyles;
}

/**
 * useComputedStylesForBlock - кастомный хук для получения стилей с дополнительной логикой
 *
 * @param instanceId - ID экземпляра
 * @param blockId - ID блока
 * @param fallbackStyles - резервные стили, если вычисленные стили не найдены
 */
export function useComputedStylesForBlock(
  instanceId: string,
  blockId: string,
  fallbackStyles: React.CSSProperties = {}
): React.CSSProperties {
  const computedStyles = useBlockComputedStyles(instanceId, blockId);

  // Если стили не найдены, возвращаем fallback
  if (Object.keys(computedStyles).length === 0) {
    return fallbackStyles;
  }

  return computedStyles;
}

/**
 * Пример использования в существующем блоке:
 *
 * ```tsx
 * // В ButtonBlock.tsx
 * import { StyledBlock } from '../StyledBlockWrapper';
 *
 * export const ButtonBlock: React.FC<ButtonBlockProps> = ({ block, ...props }) => {
 *   const buttonStyles = useBlockComputedStyles(block.id, 'button-element');
 *
 *   return (
 *     <StyledBlock
 *       instanceId={block.id}
 *       blockId="button-element"
 *       className="button-block"
 *     >
 *       <button style={buttonStyles}>
 *         {block.content?.text || 'Button'}
 *       </button>
 *     </StyledBlock>
 *   );
 * };
 * ```
 */

export default StyledBlockWrapper;

