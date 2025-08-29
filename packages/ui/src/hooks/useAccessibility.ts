import { useState, useEffect, useRef, useCallback } from 'react';

export interface AriaLiveOptions {
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export function useAriaLive(initialMessage = '', options: AriaLiveOptions = {}) {
  const [message, setMessage] = useState(initialMessage);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((newMessage: string) => {
    if (options.delay && options.delay > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setMessage(newMessage);
      }, options.delay);
    } else {
      setMessage(newMessage);
    }
  }, [options.delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    message,
    announce,
    setMessage,
    priority: options.priority || 'polite',
  };
}

export function useKeyboardNavigation(
  items: any[],
  onSelect?: (item: any, index: number) => void,
  loop = true
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!items.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const next = loop ? (prev + 1) % items.length : Math.min(prev + 1, items.length - 1);
          return next;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          const next = loop ? (prev - 1 + items.length) % items.length : Math.max(prev - 1, 0);
          return next;
        });
        break;

      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setFocusedIndex(items.length - 1);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onSelect?.(items[focusedIndex], focusedIndex);
        }
        break;

      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  }, [items, focusedIndex, onSelect, loop]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}

export function useFocusTrap(active = false) {
  const containerRef = useRef<HTMLElement>(null);
  const firstFocusableRef = useRef<HTMLElement>();
  const lastFocusableRef = useRef<HTMLElement>();

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, [focusableSelectors]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!active || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [active, getFocusableElements]);

  useEffect(() => {
    if (!active) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, handleKeyDown, getFocusableElements]);

  return containerRef;
}

export function useId(prefix = 'ui') {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
}

export function useDescription(id: string, description?: string) {
  const descriptionId = useId('desc');

  return {
    describedBy: description ? descriptionId : undefined,
    descriptionProps: description ? {
      id: descriptionId,
      children: description,
    } : undefined,
  };
}

export function useLabel(id: string, label?: string) {
  const labelId = useId('label');

  return {
    labelledBy: label ? labelId : undefined,
    labelProps: label ? {
      id: labelId,
      htmlFor: id,
      children: label,
    } : undefined,
  };
}

export interface AnnouncerOptions {
  priority?: 'polite' | 'assertive';
  timeout?: number;
}

export function useAnnouncer() {
  const announce = useCallback((message: string, options: AnnouncerOptions = {}) => {
    const { priority = 'polite', timeout } = options;

    // Создаем временный элемент для объявления
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';

    document.body.appendChild(announcer);
    announcer.textContent = message;

    // Удаляем элемент после объявления
    const cleanup = () => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    };

    if (timeout) {
      setTimeout(cleanup, timeout);
    } else {
      // Автоматическая очистка через некоторое время
      setTimeout(cleanup, 1000);
    }
  }, []);

  return { announce };
}
