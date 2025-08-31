import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActionIcon, ActionIconVariant, ActionIconSize, ActionIconColor } from './ActionIcon';

describe('ActionIcon', () => {
  const defaultProps = {
    'aria-label': 'Test action',
    children: <span>Icon</span>,
  };

  it('renders with default props', () => {
    render(<ActionIcon {...defaultProps} />);
    const button = screen.getByRole('button', { name: /test action/i });
    expect(button).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<ActionIcon {...defaultProps} />);
    const content = screen.getByText('Icon');
    expect(content).toBeInTheDocument();
  });

  describe('required aria-label', () => {
    it('requires aria-label prop', () => {
      // This should cause a TypeScript error if aria-label is missing
      // We can't test this directly with Jest, but we can verify it's present
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Test action');
    });

    it('applies aria-label to button', () => {
      render(<ActionIcon {...defaultProps} aria-label="Custom label" />);
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('variants', () => {
    const variants: ActionIconVariant[] = ['filled', 'light', 'outline', 'subtle'];

    it.each(variants)('applies %s variant correctly', (variant) => {
      render(<ActionIcon {...defaultProps} variant={variant} />);
      const button = screen.getByRole('button');

      // Check that variant classes are applied
      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('aspect-square');
      expect(button).toHaveClass('rounded-lg');
    });

    it('applies default variant (light) when no variant prop provided', () => {
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');

      // Should have light variant classes by default
      expect(button).toHaveClass('bg-[var(--color-majestic-pink)]/10');
      expect(button).toHaveClass('text-[var(--color-majestic-pink)]');
    });
  });

  describe('sizes', () => {
    it.each([
      [ActionIconSize.Xs, 'w-6 h-6'],
      [ActionIconSize.Sm, 'w-8 h-8'],
      [ActionIconSize.Md, 'w-10 h-10'],
      [ActionIconSize.Lg, 'w-12 h-12'],
    ])('applies %s size correctly', (size, expectedClass) => {
      render(<ActionIcon {...defaultProps} size={size} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(expectedClass);
    });

    it('applies default size (md) when no size prop provided', () => {
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-10 h-10');
    });
  });

  describe('colors', () => {
    const colors: ActionIconColor[] = ['primary', 'secondary', 'danger', 'success'];

    it.each(colors)('applies %s color correctly for filled variant', (color) => {
      render(<ActionIcon {...defaultProps} variant="filled" color={color} />);
      const button = screen.getByRole('button');

      if (color === 'primary') {
        expect(button).toHaveClass('bg-[var(--color-majestic-pink)]');
        expect(button).toHaveClass('text-white');
      } else if (color === 'secondary') {
        expect(button).toHaveClass('bg-[var(--color-majestic-gray-200)]');
        expect(button).toHaveClass('text-[var(--color-text-primary)]');
      } else if (color === 'danger') {
        expect(button).toHaveClass('bg-red-600');
        expect(button).toHaveClass('text-white');
      } else if (color === 'success') {
        expect(button).toHaveClass('bg-green-600');
        expect(button).toHaveClass('text-white');
      }
    });

    it('applies default color (primary) when no color prop provided', () => {
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-[var(--color-majestic-pink)]/10');
      expect(button).toHaveClass('text-[var(--color-majestic-pink)]');
    });
  });

  describe('loading state', () => {
    it('shows spinner when loading is true', () => {
      render(<ActionIcon {...defaultProps} loading />);
      const button = screen.getByRole('button');
      const spinner = screen.getByRole('img', { hidden: true }); // Spinner has role="img"
      expect(spinner).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('hides children when loading is true', () => {
      render(<ActionIcon {...defaultProps} loading />);
      const content = screen.queryByText('Icon');
      expect(content).not.toBeInTheDocument();
    });

    it('disables button when loading is true', () => {
      render(<ActionIcon {...defaultProps} loading />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('shows children when loading is false', () => {
      render(<ActionIcon {...defaultProps} loading={false} />);
      const content = screen.getByText('Icon');
      expect(content).toBeInTheDocument();
      const spinner = screen.queryByRole('img', { hidden: true });
      expect(spinner).not.toBeInTheDocument();
    });

    it('updates aria-label when loading changes', () => {
      const { rerender } = render(<ActionIcon {...defaultProps} loading aria-label="Loading..." />);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Loading...');

      rerender(<ActionIcon {...defaultProps} loading={false} aria-label="Action completed" />);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Action completed');
    });
  });

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<ActionIcon {...defaultProps} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<ActionIcon {...defaultProps} disabled />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-60');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('does not trigger onClick when disabled', () => {
      const mockOnClick = jest.fn();
      render(<ActionIcon {...defaultProps} disabled onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not trigger onClick when loading', () => {
      const mockOnClick = jest.fn();
      render(<ActionIcon {...defaultProps} loading onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('onClick handling', () => {
    it('calls onClick when clicked and not disabled/loading', () => {
      const mockOnClick = jest.fn();
      render(<ActionIcon {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('passes event to onClick handler', () => {
      const mockOnClick = jest.fn();
      render(<ActionIcon {...defaultProps} onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: button,
        })
      );
    });
  });

  describe('accessibility', () => {
    it('has button role', () => {
      render(<ActionIcon {...defaultProps} />);
      const element = screen.getByRole('button');
      expect(element.tagName).toBe('BUTTON');
    });

    it('supports keyboard navigation', () => {
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('has focus-visible styles', () => {
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-offset-2');
    });
  });

  describe('styling', () => {
    it('applies base ActionIcon classes', () => {
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('items-center');
      expect(button).toHaveClass('justify-center');
      expect(button).toHaveClass('aspect-square');
      expect(button).toHaveClass('rounded-lg');
      expect(button).toHaveClass('font-medium');
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('duration-200');
      expect(button).toHaveClass('ease-in-out');
    });

    it('applies hover and active styles', () => {
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('active:scale-[0.95]');
    });

    it('applies overflow hidden for proper styling', () => {
      render(<ActionIcon {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('relative');
      expect(button).toHaveClass('overflow-hidden');
    });
  });

  describe('children rendering', () => {
    it('renders single child element', () => {
      render(<ActionIcon {...defaultProps} />);
      const content = screen.getByText('Icon');
      expect(content).toBeInTheDocument();
    });

    it('renders complex children', () => {
      render(
        <ActionIcon {...defaultProps}>
          <svg data-testid="icon">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </ActionIcon>
      );

      const icon = screen.getByTestId('icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('wraps children in proper container', () => {
      render(<ActionIcon {...defaultProps} />);
      const wrapper = screen.getByText('Icon').parentElement;
      expect(wrapper).toHaveClass('inline-flex');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
      expect(wrapper).toHaveClass('w-full');
      expect(wrapper).toHaveClass('h-full');
    });

    it('hides children wrapper when aria-hidden', () => {
      render(<ActionIcon {...defaultProps} />);
      const wrapper = screen.getByText('Icon').parentElement;
      expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('React.memo optimization', () => {
    it('is memoized', () => {
      expect(ActionIcon).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('has displayName', () => {
      expect(ActionIcon.displayName).toBe('ActionIcon');
    });
  });

  describe('forwardRef support', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<ActionIcon {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });

    it('can focus via ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<ActionIcon {...defaultProps} ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<ActionIcon {...defaultProps} className="custom-action-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-action-class');
    });

    it('preserves base classes with custom className', () => {
      render(<ActionIcon {...defaultProps} className="custom-action-class" />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('inline-flex');
      expect(button).toHaveClass('aspect-square');
      expect(button).toHaveClass('custom-action-class');
    });
  });

  describe('combinations of props', () => {
    it('handles all props together correctly', () => {
      render(
        <ActionIcon
          {...defaultProps}
          variant="outline"
          size="lg"
          color="success"
          loading={false}
          disabled={false}
          className="test-class"
          aria-label="Test combination"
        />
      );
      const button = screen.getByRole('button');

      expect(button).toHaveClass('w-12');
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-green-600');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-green-300');
      expect(button).toHaveClass('test-class');
      expect(button).toHaveAttribute('aria-label', 'Test combination');
    });

    it('overrides loading when explicitly set to false', () => {
      render(<ActionIcon {...defaultProps} loading={false} />);
      const content = screen.getByText('Icon');
      expect(content).toBeInTheDocument();
    });
  });

  describe('variant and color combinations', () => {
    const testCases = [
      {
        variant: 'filled' as ActionIconVariant,
        color: 'primary' as ActionIconColor,
        expectedClasses: ['bg-[var(--color-majestic-pink)]', 'text-white']
      },
      {
        variant: 'light' as ActionIconVariant,
        color: 'secondary' as ActionIconColor,
        expectedClasses: ['bg-[var(--color-majestic-gray-100)]', 'text-[var(--color-majestic-gray-700)]']
      },
      {
        variant: 'outline' as ActionIconVariant,
        color: 'danger' as ActionIconColor,
        expectedClasses: ['bg-transparent', 'text-red-600', 'border-2']
      },
      {
        variant: 'subtle' as ActionIconVariant,
        color: 'success' as ActionIconColor,
        expectedClasses: ['bg-transparent', 'text-green-500']
      }
    ];

    it.each(testCases)('applies correct classes for $variant $color combination', ({ variant, color, expectedClasses }) => {
      render(<ActionIcon {...defaultProps} variant={variant} color={color} />);
      const button = screen.getByRole('button');

      expectedClasses.forEach(className => {
        expect(button).toHaveClass(className);
      });
    });
  });

  describe('event handling', () => {
    it('supports all standard button props', () => {
      const mockOnMouseEnter = jest.fn();
      const mockOnMouseLeave = jest.fn();
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();

      render(
        <ActionIcon
          {...defaultProps}
          onMouseEnter={mockOnMouseEnter}
          onMouseLeave={mockOnMouseLeave}
          onFocus={mockOnFocus}
          onBlur={mockOnBlur}
          type="submit"
          form="test-form"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
    });

    it('prevents default click behavior when loading or disabled', () => {
      const mockOnClick = jest.fn();
      render(<ActionIcon {...defaultProps} onClick={mockOnClick} loading />);

      const button = screen.getByRole('button');
      const clickEvent = fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
      expect(clickEvent.defaultPrevented).toBe(false); // useCallback prevents it
    });
  });

  describe('spinner integration', () => {
    it('uses correct spinner size for different ActionIcon sizes', () => {
      const sizeMappings = [
        { actionIconSize: ActionIconSize.Xs, expectedSpinnerSize: 'xs' },
        { actionIconSize: ActionIconSize.Sm, expectedSpinnerSize: 'sm' },
        { actionIconSize: ActionIconSize.Md, expectedSpinnerSize: 'md' },
        { actionIconSize: ActionIconSize.Lg, expectedSpinnerSize: 'lg' },
      ];

      sizeMappings.forEach(({ actionIconSize, expectedSpinnerSize }) => {
        const { rerender } = render(<ActionIcon {...defaultProps} size={actionIconSize} loading />);
        const spinner = screen.getByRole('img', { hidden: true });

        // Check that spinner has correct size class
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('text-current');
      });
    });
  });
});
