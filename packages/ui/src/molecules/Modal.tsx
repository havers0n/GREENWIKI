import React, { useEffect, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens types
export const ModalSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
  Xl: 'xl',
} as const;
export type ModalSize = typeof ModalSize[keyof typeof ModalSize];

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  centered?: boolean;
  withCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// Modal styles using design tokens
const modalVariants = {
  overlay: cn(
    'fixed inset-0 z-50',
    'flex items-center justify-center',
    'bg-[var(--color-overlay-modal)]',
    'transition-opacity duration-300 ease-out'
  ),
  container: cn(
    'relative z-10',
    'w-full mx-4',
    'bg-[var(--color-bg-modal)]',
    'border border-[var(--color-border-modal)]',
    'rounded-xl',
    'shadow-[var(--shadow-modal)]',
    'transform transition-all duration-300 ease-out',
    'max-h-[90vh] overflow-hidden'
  ),
  header: cn(
    'flex items-center justify-between',
    'px-6 py-4',
    'border-b border-[var(--color-border-default)]'
  ),
  title: cn(
    'text-lg font-semibold',
    'text-[var(--color-text-primary)]',
    'pr-4'
  ),
  closeButton: cn(
    'flex items-center justify-center',
    'w-8 h-8 rounded-lg',
    'text-[var(--color-text-secondary)]',
    'hover:text-[var(--color-text-primary)]',
    'hover:bg-[var(--color-bg-hover)]',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2',
    'ml-2'
  ),
  body: cn(
    'px-6 py-4',
    'overflow-y-auto',
    'max-h-[calc(90vh-8rem)]'
  ),
  sizes: {
    [ModalSize.Sm]: 'max-w-sm',
    [ModalSize.Md]: 'max-w-2xl',
    [ModalSize.Lg]: 'max-w-4xl',
    [ModalSize.Xl]: 'max-w-6xl',
  },
};

// Custom hook for focus trap
const useFocusTrap = (isOpen: boolean, containerRef: React.RefObject<HTMLElement>) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', ')));
  }, []);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);

    if (focusableElements.length > 0) {
      // Focus the first focusable element or the container itself
      const firstFocusable = focusableElements[0];
      firstFocusable.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements(container);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: move to previous element
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next element
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!container.contains(e.target as Node)) {
        // Focus back to container if clicked outside
        container.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, containerRef, getFocusableElements]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      // Small delay to ensure modal is fully closed
      setTimeout(() => {
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);
};

export const Modal = React.memo<ModalProps>(
  ({
    children,
    isOpen,
    onClose,
    title,
    size = ModalSize.Md,
    centered = true,
    withCloseButton = true,
    closeOnClickOutside = true,
    closeOnEscape = true,
    className = '',
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const modalId = React.useId();
    const titleId = `${modalId}-title`;
    const bodyId = `${modalId}-body`;

    // Use focus trap
    useFocusTrap(isOpen, containerRef);

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape, onClose]);

    // Handle click outside
    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (closeOnClickOutside && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnClickOutside, onClose]
    );

    if (!isOpen) return null;

    return (
      <div
        className={cn(
          modalVariants.overlay,
          centered ? 'items-center' : 'items-start pt-20'
        )}
        onClick={handleOverlayClick}
        role="presentation"
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={bodyId}
          tabIndex={-1}
          className={cn(
            modalVariants.container,
            modalVariants.sizes[size],
            className
          )}
        >
          {/* Header */}
          {(title || withCloseButton) && (
            <div className={modalVariants.header}>
              {title && (
                <h2 id={titleId} className={modalVariants.title}>
                  {title}
                </h2>
              )}
              {withCloseButton && (
                <button
                  type="button"
                  aria-label="Закрыть модальное окно"
                  className={modalVariants.closeButton}
                  onClick={onClose}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4L4 12M4 4L12 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div id={bodyId} className={modalVariants.body}>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';


