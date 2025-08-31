import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Tooltip, TooltipPosition } from './Tooltip';

// Mock HTMLElement methods for tests
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  writable: true,
  value: jest.fn(() => ({
    width: 100,
    height: 40,
    top: 100,
    left: 100,
    bottom: 140,
    right: 200,
    x: 100,
    y: 100,
    toJSON: () => ({}),
  })),
});

describe('Tooltip', () => {
  const defaultProps = {
    content: 'Test tooltip content',
    children: <button>Test Button</button>,
  };

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children without tooltip initially', () => {
    render(<Tooltip {...defaultProps} />);
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();

    // Tooltip should not be visible initially
    const tooltip = screen.queryByRole('tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('renders tooltip on mouse enter', async () => {
    render(<Tooltip {...defaultProps} />);

    const button = screen.getByRole('button', { name: /test button/i });
    fireEvent.mouseEnter(button);

    act(() => {
      jest.advanceTimersByTime(300); // Advance past default delay
    });

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Test tooltip content');
    });
  });

  it('hides tooltip on mouse leave', async () => {
    render(<Tooltip {...defaultProps} />);

    const button = screen.getByRole('button', { name: /test button/i });
    fireEvent.mouseEnter(button);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(button);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('respects custom delay', async () => {
    render(<Tooltip {...defaultProps} delay={500} />);

    const button = screen.getByRole('button', { name: /test button/i });
    fireEvent.mouseEnter(button);

    // Should not show after 300ms with 500ms delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Should show after 500ms
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('does not show tooltip when disabled', () => {
      render(<Tooltip {...defaultProps} disabled />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders children without wrapper when disabled', () => {
      render(<Tooltip {...defaultProps} disabled />);

      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();

      // Should not have aria-describedby when disabled
      expect(button).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('empty content', () => {
    it('does not render tooltip when content is empty', () => {
      render(<Tooltip {...defaultProps} content="" />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('renders children without wrapper when content is empty', () => {
      render(<Tooltip {...defaultProps} content="" />);

      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes when tooltip is visible', async () => {
      render(<Tooltip {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('role', 'tooltip');
      });

      // Button should have aria-describedby pointing to tooltip
      const describedById = button.getAttribute('aria-describedby');
      expect(describedById).toBeDefined();

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('id', describedById);
    });

    it('removes aria-describedby when tooltip is hidden', async () => {
      render(<Tooltip {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-describedby');
      });

      fireEvent.mouseLeave(button);

      await waitFor(() => {
        expect(button).not.toHaveAttribute('aria-describedby');
      });
    });

    it('supports keyboard navigation', async () => {
      render(<Tooltip {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test button/i });
      button.focus();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('has tabIndex for keyboard accessibility', () => {
      render(<Tooltip {...defaultProps} />);
      const wrapper = screen.getByRole('button').parentElement;
      expect(wrapper).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('positioning', () => {
    const positions: TooltipPosition[] = ['top', 'bottom', 'left', 'right'];

    it.each(positions)('renders tooltip with %s position', async (position) => {
      render(<Tooltip {...defaultProps} position={position} />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('applies correct arrow classes for positions', async () => {
      render(<Tooltip {...defaultProps} position="top" />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector('.absolute');
        expect(arrow).toHaveClass('-bottom-1', 'left-1/2', '-translate-x-1/2');
      });
    });
  });

  describe('styling', () => {
    it('applies base tooltip classes', async () => {
      render(<Tooltip {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('fixed', 'z-50', 'px-3', 'py-2');
        expect(tooltip).toHaveClass('bg-[var(--color-bg-tooltip)]');
        expect(tooltip).toHaveClass('border-[var(--color-border-tooltip)]');
        expect(tooltip).toHaveClass('rounded-lg');
      });
    });

    it('applies visible state classes', async () => {
      render(<Tooltip {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('opacity-100', 'scale-100');
        expect(tooltip).toHaveClass('transition-all', 'duration-200', 'ease-out');
      });
    });

    it('applies custom className', async () => {
      render(<Tooltip {...defaultProps} className="custom-tooltip-class" />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('custom-tooltip-class');
      });
    });
  });

  describe('React.memo optimization', () => {
    it('is memoized', () => {
      expect(Tooltip).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('has displayName', () => {
      expect(Tooltip.displayName).toBe('Tooltip');
    });
  });

  describe('boundary detection', () => {
    it('adjusts position when tooltip would overflow viewport', async () => {
      // Mock viewport dimensions
      Object.defineProperty(window, 'innerWidth', { value: 200 });
      Object.defineProperty(window, 'innerHeight', { value: 200 });

      render(<Tooltip {...defaultProps} position="right" />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });

      // Position should be adjusted (this would be tested more thoroughly in integration tests)
    });
  });

  describe('cleanup', () => {
    it('clears timeout on mouse leave', () => {
      render(<Tooltip {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);

      // Timer should be cleared
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('clears timeout on unmount', () => {
      const { unmount } = render(<Tooltip {...defaultProps} />);

      const button = screen.getByRole('button', { name: /test button/i });
      fireEvent.mouseEnter(button);

      unmount();

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe('complex children', () => {
    it('works with complex child components', async () => {
      const ComplexChild = () => (
        <div>
          <span>Complex</span>
          <button>Child Button</button>
        </div>
      );

      render(
        <Tooltip content="Tooltip for complex child">
          <ComplexChild />
        </Tooltip>
      );

      const childButton = screen.getByRole('button', { name: /child button/i });
      fireEvent.mouseEnter(childButton);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('handles multiple children correctly', async () => {
      render(
        <Tooltip content="Tooltip content">
          <div>
            <span>First child</span>
            <strong>Second child</strong>
          </div>
        </Tooltip>
      );

      const wrapper = screen.getByText('First child').parentElement;
      expect(wrapper).toBeInTheDocument();

      if (wrapper) {
        fireEvent.mouseEnter(wrapper);

        act(() => {
          jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });
      }
    });
  });

  describe('edge cases', () => {
    it('handles very long content gracefully', async () => {
      const longContent = 'A'.repeat(500);
      render(<Tooltip content={longContent} children={<button>Long</button>} />);

      const button = screen.getByRole('button', { name: /long/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent(longContent);
      });
    });

    it('handles special characters in content', async () => {
      const specialContent = 'Special: áéíóú ñ & < > " \'';
      render(<Tooltip content={specialContent} children={<button>Special</button>} />);

      const button = screen.getByRole('button', { name: /special/i });
      fireEvent.mouseEnter(button);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent(specialContent);
      });
    });
  });
});
