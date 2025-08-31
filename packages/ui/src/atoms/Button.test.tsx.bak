import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

// Mock Spinner component since we're testing Button in isolation
jest.mock('./Spinner', () => ({
  Spinner: ({ size, className }: { size: string; className?: string }) => (
    <div data-testid="spinner" data-size={size} className={className}>
      Loading...
    </div>
  ),
}));

describe('Button', () => {
  const defaultProps = {
    children: 'Click me',
  };

  it('renders with default props', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-[var(--color-majestic-pink)]');
  });

  it('renders with custom className', () => {
    render(<Button {...defaultProps} className="custom-class" />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('custom-class');
  });

  describe('variants', () => {
    it.each([
      ['primary', 'bg-[var(--color-majestic-pink)]'],
      ['secondary', 'bg-[var(--color-majestic-gray-200)]'],
      ['danger', 'bg-red-600'],
      ['ghost', 'bg-transparent'],
    ])('renders %s variant correctly', (variant, expectedClass) => {
      render(<Button {...defaultProps} variant={variant as any} />);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass(expectedClass);
    });
  });

  describe('sizes', () => {
    it.each([
      ['xs', 'text-xs'],
      ['sm', 'text-sm'],
      ['md', 'text-sm'],
      ['lg', 'text-base'],
    ])('renders %s size correctly', (size, expectedClass) => {
      render(<Button {...defaultProps} size={size as any} />);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass(expectedClass);
    });
  });

  describe('states', () => {
    it('renders disabled state correctly', () => {
      render(<Button {...defaultProps} disabled />);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-60', 'cursor-not-allowed');
    });

    it('renders loading state correctly', () => {
      render(<Button {...defaultProps} loading />);
      const button = screen.getByRole('button', { name: /click me/i });
      const spinner = screen.getByTestId('spinner');

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveClass('cursor-wait');
      expect(spinner).toBeInTheDocument();
    });

    it('hides icons when loading', () => {
      render(
        <Button
          {...defaultProps}
          loading
          leftIcon={<span>Icon</span>}
          rightIcon={<span>Icon</span>}
        />
      );
      const button = screen.getByRole('button', { name: /click me/i });
      const spinner = screen.getByTestId('spinner');

      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('Icon')).not.toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('renders left icon correctly', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      render(<Button {...defaultProps} leftIcon={leftIcon} />);
      const button = screen.getByRole('button', { name: /click me/i });
      const icon = screen.getByTestId('left-icon');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders right icon correctly', () => {
      const rightIcon = <span data-testid="right-icon">→</span>;
      render(<Button {...defaultProps} rightIcon={rightIcon} />);
      const button = screen.getByRole('button', { name: /click me/i });
      const icon = screen.getByTestId('right-icon');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders both icons correctly', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      const rightIcon = <span data-testid="right-icon">→</span>;
      render(<Button {...defaultProps} leftIcon={leftIcon} rightIcon={rightIcon} />);
      const button = screen.getByRole('button', { name: /click me/i });

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('fullWidth', () => {
    it('applies fullWidth class when fullWidth is true', () => {
      render(<Button {...defaultProps} fullWidth />);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveClass('w-full');
    });

    it('does not apply fullWidth class when fullWidth is false', () => {
      render(<Button {...defaultProps} fullWidth={false} />);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('events', () => {
    it('calls onClick when clicked', () => {
      const onClick = jest.fn();
      render(<Button {...defaultProps} onClick={onClick} />);
      const button = screen.getByRole('button', { name: /click me/i });

      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const onClick = jest.fn();
      render(<Button {...defaultProps} onClick={onClick} disabled />);
      const button = screen.getByRole('button', { name: /click me/i });

      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const onClick = jest.fn();
      render(<Button {...defaultProps} onClick={onClick} loading />);
      const button = screen.getByRole('button', { name: /click me/i });

      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has correct aria-busy attribute when loading', () => {
      render(<Button {...defaultProps} loading />);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('does not have aria-busy attribute when not loading', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).not.toHaveAttribute('aria-busy');
    });

    it('passes through other props to button element', () => {
      render(<Button {...defaultProps} type="submit" data-testid="custom-button" />);
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('forwardRef', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button {...defaultProps} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('spinner sizing', () => {
    it.each([
      ['xs', 'sm'],
      ['sm', 'sm'],
      ['md', 'md'],
      ['lg', 'lg'],
    ])('uses correct spinner size for button size %s', (buttonSize, expectedSpinnerSize) => {
      render(<Button {...defaultProps} size={buttonSize as any} loading />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveAttribute('data-size', expectedSpinnerSize);
    });
  });
});
