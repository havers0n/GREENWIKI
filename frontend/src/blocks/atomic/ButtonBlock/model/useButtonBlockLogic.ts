import { useMemo, useCallback } from 'react';
import type {
  UseButtonBlockLogicResult,
  LinkConfig,
  LinkType
} from '../types';

/**
 * Хук для логики работы с ButtonBlock
 * Обрабатывает различные типы ссылок и клики
 */
export const useButtonBlockLogic = (
  link?: string,
  linkTarget?: '_blank' | '_self' | '_parent' | '_top',
  onClick?: (event: React.MouseEvent) => void
): UseButtonBlockLogicResult => {
  // Определяем тип ссылки
  const linkConfig: LinkConfig = useMemo(() => {
    if (!link || link === '#') {
      return { type: 'none' };
    }

    if (link.startsWith('http')) {
      return {
        type: 'external',
        url: link,
        target: linkTarget || '_blank'
      };
    }

    return {
      type: 'internal',
      url: link,
      target: linkTarget || '_self'
    };
  }, [link, linkTarget]);

  // Обработчик клика
  const handleClick = useCallback((event: React.MouseEvent) => {
    // Сначала выполняем пользовательский обработчик
    if (onClick) {
      onClick(event);
    }

    // Если событие уже отменено, не продолжаем
    if (event.defaultPrevented) {
      return;
    }

    // Обработка внешних ссылок
    if (linkConfig.type === 'external' && linkConfig.url) {
      event.preventDefault();
      window.open(linkConfig.url, linkConfig.target, 'noopener,noreferrer');
    }

    // Для внутренних ссылок позволяем стандартную навигацию
    // Для отсутствия ссылки - просто выполняем пользовательский обработчик
  }, [linkConfig, onClick]);

  return {
    linkConfig,
    handleClick,
    isExternalLink: linkConfig.type === 'external',
    isInternalLink: linkConfig.type === 'internal'
  };
};
