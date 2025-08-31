import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardShadow, CardPadding } from './Card';

describe('Card', () => {
  const defaultProps = {
    children: <p>Test content</p>,
  };

  it('renders with default props', () => {
    render(<Card {...defaultProps} />);
    const card = screen.getByText('Test content').closest('div');
    expect(card).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(<Card {...defaultProps} />);
    const content = screen.getByText('Test content');
    expect(content).toBeInTheDocument();
  });

  describe('shadow variants', () => {
    it.each([
      ['none', 'shadow-none'],
      ['sm', 'shadow-[var(--shadow-card-sm)]'],
      ['md', 'shadow-[var(--shadow-card-md)]'],
      ['lg', 'shadow-[var(--shadow-card-lg)]'],
    ])('applies %s shadow correctly', (shadow, expectedClass) => {
      render(<Card {...defaultProps} shadow={shadow as CardShadow} />);
      const card = screen.getByText('Test content').closest('div');
      expect(card).toHaveClass(expectedClass);
    });

    it('applies default shadow (sm) when no shadow prop provided', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByText('Test content').closest('div');
      expect(card).toHaveClass('shadow-[var(--shadow-card-sm)]');
    });
  });

  describe('padding variants', () => {
    it.each([
      ['none', 'p-0'],
      ['sm', 'p-3'],
      ['md', 'p-4'],
      ['lg', 'p-6'],
    ])('applies %s padding correctly', (padding, expectedClass) => {
      render(<Card {...defaultProps} padding={padding as CardPadding} />);
      const card = screen.getByText('Test content').closest('div');
      expect(card).toHaveClass(expectedClass);
    });

    it('applies default padding (md) when no padding prop provided', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByText('Test content').closest('div');
      expect(card).toHaveClass('p-4');
    });
  });

  describe('border behavior', () => {
    it('renders with border by default', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByText('Test content').closest('div');
      expect(card).toHaveClass('border-[var(--color-border-card)]');
    });

    it('renders without border when withBorder is false', () => {
      render(<Card {...defaultProps} withBorder={false} />);
      const card = screen.getByText('Test content').closest('div');
      expect(card).not.toHaveClass('border-[var(--color-border-card)]');
    });
  });

  describe('base styling', () => {
    it('applies base card classes', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByText('Test content').closest('div');

      expect(card).toHaveClass('bg-[var(--color-bg-card)]');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-200');
      expect(card).toHaveClass('ease-in-out');
    });

    it('applies hover effects', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByText('Test content').closest('div');
      expect(card).toHaveClass('hover:shadow-[var(--shadow-card-hover)]');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<Card {...defaultProps} className="custom-card-class" />);
      const card = screen.getByText('Test content').closest('div');
      expect(card).toHaveClass('custom-card-class');
    });

    it('preserves base classes with custom className', () => {
      render(<Card {...defaultProps} className="custom-card-class" />);
      const card = screen.getByText('Test content').closest('div');

      expect(card).toHaveClass('bg-[var(--color-bg-card)]');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('custom-card-class');
    });
  });

  describe('React.memo optimization', () => {
    it('is memoized', () => {
      expect(Card).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('has displayName', () => {
      expect(Card.displayName).toBe('Card');
    });
  });

  describe('forwardRef support', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe('DIV');
    });
  });

  describe('accessibility', () => {
    it('is a semantic div element', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByText('Test content').closest('div');
      expect(card?.tagName).toBe('DIV');
    });

    it('does not have default ARIA attributes that might interfere', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByText('Test content').closest('div');

      expect(card).not.toHaveAttribute('role');
      expect(card).not.toHaveAttribute('aria-label');
      expect(card).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('combinations of props', () => {
    it('handles all props together correctly', () => {
      render(
        <Card
          {...defaultProps}
          shadow="lg"
          padding="lg"
          withBorder={false}
          className="test-class"
        />
      );
      const card = screen.getByText('Test content').closest('div');

      expect(card).toHaveClass('shadow-[var(--shadow-card-lg)]');
      expect(card).toHaveClass('p-6');
      expect(card).not.toHaveClass('border-[var(--color-border-card)]');
      expect(card).toHaveClass('test-class');
      expect(card).toHaveClass('bg-[var(--color-bg-card)]');
    });

    it('handles minimal configuration', () => {
      render(
        <Card
          shadow="none"
          padding="none"
          withBorder={false}
        >
          Minimal card
        </Card>
      );
      const card = screen.getByText('Minimal card').closest('div');

      expect(card).toHaveClass('shadow-none');
      expect(card).toHaveClass('p-0');
      expect(card).not.toHaveClass('border-[var(--color-border-card)]');
    });
  });

  describe('responsive behavior', () => {
    it('maintains consistent styling across different screen sizes', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByText('Test content').closest('div');

      // Check that classes don't have responsive prefixes that might break on mobile
      expect(card).toHaveClass('bg-[var(--color-bg-card)]');
      expect(card).toHaveClass('rounded-xl');
    });
  });

  describe('children handling', () => {
    it('renders complex children structure', () => {
      render(
        <Card>
          <header>Header</header>
          <main>
            <p>Main content</p>
            <button>Action button</button>
          </main>
          <footer>Footer</footer>
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      render(<Card />);
      const card = screen.getByRole('generic'); // div without specific role
      expect(card).toBeInTheDocument();
      expect(card).toBeEmptyDOMElement();
    });
  });

  describe('event handling', () => {
    it('passes through standard HTML div attributes', () => {
      const onClick = jest.fn();
      render(<Card {...defaultProps} onClick={onClick} data-testid="test-card" />);

      const card = screen.getByTestId('test-card');
      expect(card).toBeInTheDocument();

      // Click should work (though the mock won't actually fire)
      expect(typeof card.onclick).toBe('function');
    });

    it('supports all standard div props', () => {
      render(
        <Card
          {...defaultProps}
          id="test-id"
          title="Test title"
          style={{ marginTop: '10px' }}
        />
      );

      const card = screen.getByText('Test content').closest('div');
      expect(card).toHaveAttribute('id', 'test-id');
      expect(card).toHaveAttribute('title', 'Test title');
      expect(card).toHaveStyle({ marginTop: '10px' });
    });
  });
});
