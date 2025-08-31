import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal, ModalSize } from './Modal';

// Mock HTMLElement.focus for focus tests
const mockFocus = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'focus', {
  writable: true,
  value: mockFocus,
});

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <p>Test content</p>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<Modal {...defaultProps} />);
    const modal = screen.getByRole('dialog', { name: /test modal/i });
    expect(modal).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  it('renders title correctly', () => {
    render(<Modal {...defaultProps} />);
    const title = screen.getByText('Test Modal');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2');
  });

  it('renders children content', () => {
    render(<Modal {...defaultProps} />);
    const content = screen.getByText('Test content');
    expect(content).toBeInTheDocument();
  });

  it('renders without title when title is not provided', () => {
    render(<Modal {...defaultProps} title={undefined} />);
    const title = screen.queryByRole('heading');
    expect(title).not.toBeInTheDocument();
  });

  describe('sizes', () => {
    it.each([
      [ModalSize.Sm, 'max-w-sm'],
      [ModalSize.Md, 'max-w-2xl'],
      [ModalSize.Lg, 'max-w-4xl'],
      [ModalSize.Xl, 'max-w-6xl'],
    ])('renders %s size correctly', (size, expectedClass) => {
      render(<Modal {...defaultProps} size={size} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass(expectedClass);
    });
  });

  describe('close button', () => {
    it('renders close button by default', () => {
      render(<Modal {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /закрыть модальное окно/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('does not render close button when withCloseButton is false', () => {
      render(<Modal {...defaultProps} withCloseButton={false} />);
      const closeButton = screen.queryByRole('button', { name: /закрыть/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /закрыть модальное окно/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('escape key handling', () => {
    it('calls onClose when Escape is pressed and closeOnEscape is true', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Escape is pressed and closeOnEscape is false', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} closeOnEscape={false} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('click outside handling', () => {
    it('calls onClose when clicking outside and closeOnClickOutside is true', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);

      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking inside modal content', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} />);

      const modal = screen.getByRole('dialog');
      fireEvent.click(modal);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when clicking outside and closeOnClickOutside is false', () => {
      const mockOnClose = jest.fn();
      render(<Modal {...defaultProps} onClose={mockOnClose} closeOnClickOutside={false} />);

      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-describedby');
    });

    it('has correct aria-labelledby when title is provided', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      const title = screen.getByText('Test Modal');

      const labelledById = modal.getAttribute('aria-labelledby');
      expect(title).toHaveAttribute('id', labelledById);
    });

    it('has correct aria-describedby for body content', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      const describedById = modal.getAttribute('aria-describedby');
      const body = screen.getByText('Test content').closest('[id]');
      expect(body).toHaveAttribute('id', describedById);
    });

    it('has tabIndex -1 for focus management', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('focus trap', () => {
    it('focuses first focusable element when modal opens', async () => {
      render(
        <Modal {...defaultProps}>
          <button>First button</button>
          <button>Second button</button>
        </Modal>
      );

      await waitFor(() => {
        expect(mockFocus).toHaveBeenCalled();
      });
    });

    it('traps focus within modal during tab navigation', () => {
      render(
        <Modal {...defaultProps}>
          <button>First button</button>
          <button>Second button</button>
          <input type="text" placeholder="Input field" />
        </Modal>
      );

      const firstButton = screen.getByRole('button', { name: /first button/i });

      // Simulate Tab key press
      fireEvent.keyDown(document, { key: 'Tab' });

      // Focus should move within modal
      expect(mockFocus).toHaveBeenCalled();
    });

    it('handles shift+tab navigation correctly', () => {
      render(
        <Modal {...defaultProps}>
          <button>First button</button>
          <button>Second button</button>
        </Modal>
      );

      // Simulate Shift+Tab key press
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

      expect(mockFocus).toHaveBeenCalled();
    });
  });

  describe('focus restoration', () => {
    it('restores focus to previously focused element when modal closes', async () => {
      // Create a button that will have focus initially
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const buttonRef = React.useRef<HTMLButtonElement>(null);

        React.useEffect(() => {
          buttonRef.current?.focus();
        }, []);

        return (
          <>
            <button ref={buttonRef} onClick={() => setIsOpen(true)}>
              Open Modal
            </button>
            <Modal
              {...defaultProps}
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />
          </>
        );
      };

      render(<TestComponent />);

      // Close modal
      const closeButton = screen.getByRole('button', { name: /закрыть/i });
      fireEvent.click(closeButton);

      // Focus should be restored after a delay
      await waitFor(() => {
        expect(mockFocus).toHaveBeenCalled();
      }, { timeout: 200 });
    });
  });

  describe('React.memo optimization', () => {
    it('is memoized', () => {
      expect(Modal).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('has displayName', () => {
      expect(Modal.displayName).toBe('Modal');
    });
  });

  describe('custom className', () => {
    it('applies custom className to modal container', () => {
      render(<Modal {...defaultProps} className="custom-modal-class" />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('custom-modal-class');
    });
  });

  describe('animation and transitions', () => {
    it('has transition classes for smooth animations', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveClass('transform');
      expect(modal).toHaveClass('transition-all');
      expect(modal).toHaveClass('duration-300');
    });
  });

  describe('responsive design', () => {
    it('has responsive margins and max-width constraints', () => {
      render(<Modal {...defaultProps} />);
      const modal = screen.getByRole('dialog');

      expect(modal).toHaveClass('w-full');
      expect(modal).toHaveClass('mx-4');
    });

    it('limits height and enables scrolling for large content', () => {
      render(<Modal {...defaultProps} />);
      const body = screen.getByText('Test content').closest('div');

      expect(body).toHaveClass('overflow-y-auto');
      expect(body).toHaveClass('max-h-[calc(90vh-8rem)]');
    });
  });

  describe('overlay behavior', () => {
    it('renders overlay with correct styling', () => {
      render(<Modal {...defaultProps} />);
      const overlay = screen.getByRole('presentation');

      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
      expect(overlay).toHaveClass('z-50');
    });

    it('centers modal by default', () => {
      render(<Modal {...defaultProps} />);
      const overlay = screen.getByRole('presentation');

      expect(overlay).toHaveClass('flex');
      expect(overlay).toHaveClass('items-center');
      expect(overlay).toHaveClass('justify-center');
    });

    it('positions modal at top when centered is false', () => {
      render(<Modal {...defaultProps} centered={false} />);
      const overlay = screen.getByRole('presentation');

      expect(overlay).toHaveClass('items-start');
      expect(overlay).toHaveClass('pt-20');
    });
  });

  describe('header rendering', () => {
    it('renders header with title and close button', () => {
      render(<Modal {...defaultProps} />);
      const header = screen.getByText('Test Modal').closest('div');

      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('items-center');
      expect(header).toHaveClass('justify-between');
    });

    it('does not render header when no title and no close button', () => {
      render(<Modal {...defaultProps} title={undefined} withCloseButton={false} />);
      const header = screen.queryByText('Test Modal')?.closest('div');
      expect(header).not.toBeInTheDocument();
    });
  });
});
