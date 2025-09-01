/**
 * Пример интеграции StylePropagationEngine с существующим блоком
 *
 * Этот файл демонстрирует, как использовать новую систему стилей
 * в реальном компоненте блока.
 */

import { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { useComputedStyles, useBlockComputedStyles } from '../../store/hooks/designSystemHooks';
import { fetchDesignTokens, fetchMasterComponentStyles } from '../../store/slices/designSystemSlice';
import type { BlockNode } from '@my-forum/model';
import {
  hasText,
  hasIcon
} from '../../entities/block/lib/typeguards';

/**
 * Пример 1: Простая кнопка с использованием всех вычисленных стилей
 */
export const SimpleButtonExample = ({ block }: { block: BlockNode }) => {
  const dispatch = useAppDispatch();

  // Загружаем необходимые данные при монтировании
  useEffect(() => {
    dispatch(fetchDesignTokens());
    dispatch(fetchMasterComponentStyles('button-component'));
  }, [dispatch]);

  // Получаем все вычисленные стили для экземпляра
  const styles = useComputedStyles(block.id);

  return (
    <div style={styles['container'] || {}}>
      <button
        style={styles['button-element'] || {}}
        onClick={() => console.log('Button clicked')}
      >
        {hasText(block) ? block.content.text : 'Click me'}
      </button>
    </div>
  );
};

/**
 * Пример 2: Кнопка с отдельными стилями для каждого элемента
 */
export const AdvancedButtonExample = ({ block }: { block: BlockNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchDesignTokens());
    dispatch(fetchMasterComponentStyles('button-component'));
  }, [dispatch]);

  // Получаем стили для конкретных элементов
  const containerStyles = useBlockComputedStyles(block.id, 'container');
  const buttonStyles = useBlockComputedStyles(block.id, 'button-element');
  const iconStyles = useBlockComputedStyles(block.id, 'icon-element');

  return (
    <div style={containerStyles}>
      <button style={buttonStyles}>
        {hasIcon(block) && (
          <span style={iconStyles}>
            {block.content.icon}
          </span>
        )}
        {hasText(block) ? block.content.text : 'Button'}
      </button>
    </div>
  );
};

/**
 * Пример 3: Использование с условными стилями
 */
export const ConditionalButtonExample = ({ block }: { block: BlockNode }) => {
  const dispatch = useAppDispatch();
  const buttonStyles = useBlockComputedStyles(block.id, 'button-element');

  useEffect(() => {
    dispatch(fetchDesignTokens());
    dispatch(fetchMasterComponentStyles('button-component'));
  }, [dispatch]);

  // Дополнительные стили на основе состояния
  const hoverStyles = buttonStyles; // Временное решение для hover стилей

  return (
    <button style={hoverStyles}>
      {hasText(block) ? block.content.text : 'Hover me'}
    </button>
  );
};

/**
 * Пример 4: Интеграция с существующей системой блоков
 */
export const IntegratedButtonBlock = ({ block }: { block: BlockNode }) => {
  const dispatch = useAppDispatch();

  // Всегда вызываем хуки на верхнем уровне
  const buttonStyles = useBlockComputedStyles(block.id, 'button-element');

  useEffect(() => {
    // Загружаем дизайн-токены один раз при старте приложения
    dispatch(fetchDesignTokens());

    // Загружаем стили мастер-компонента
    if (block.instance_id) {
      dispatch(fetchMasterComponentStyles('button-component'));
    }
  }, [dispatch, block.instance_id]);

  // Используем старую систему, если блок не является экземпляром
  if (!block.instance_id) {
    return (
      <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white' }}>
        {hasText(block) ? block.content.text : 'Legacy Button'}
      </button>
    );
  }

  // Используем новую систему стилей

  return (
    <button style={buttonStyles}>
      {hasText(block) ? block.content.text : 'Modern Button'}
    </button>
  );
};

/**
 * Пример 5: Создание экземпляра с переопределениями
 */
export const CreateInstanceExample = () => {
  const createCustomButton = async () => {
    const instanceData = {
      reusableBlockId: 'button-component',
      pageId: 'current-page-id',
      overrides: {
        data: {
          text: 'Custom Green Button',
        },
        styles: {
          'button-element': {
            backgroundColor: '#10b981', // Зеленый цвет
            fontSize: '16px',
            padding: '12px 24px',
          }
        }
      }
    };

    // Здесь должен быть API вызов для создания экземпляра
    // await api.createBlockInstance(instanceData);

    console.log('Creating instance with custom styles:', instanceData);
  };

  return (
    <div>
      <button onClick={createCustomButton}>
        Create Custom Button Instance
      </button>
    </div>
  );
};

/**
 * Пример 6: Мониторинг производительности
 */
export const PerformanceExample = ({ block }: { block: BlockNode }) => {
  const startTime = performance.now();

  // Получаем стили (мемоизированные, не вызывают перерасчеты)
  const styles = useComputedStyles(block.id);

  const endTime = performance.now();
  const renderTime = endTime - startTime;

  console.log(`Styles computed in ${renderTime}ms`);

  return (
    <div>
      <div>Render time: {renderTime.toFixed(2)}ms</div>
      <button style={styles['button-element']}>
        Performance Test Button
      </button>
    </div>
  );
};

export default {
  SimpleButtonExample,
  AdvancedButtonExample,
  ConditionalButtonExample,
  IntegratedButtonBlock,
  CreateInstanceExample,
  PerformanceExample,
};

