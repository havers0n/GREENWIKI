import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  const defaultProps = {
    label: 'Test textarea',
    placeholder: 'Enter text here',
  };

  it('renders with default props', () => {
    render(<Textarea {...defaultProps} />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('rounded-lg');
    expect(textarea).toHaveClass('border-[var(--color-border-default)]');
  });

  it('renders with custom className', () => {
    render(<Textarea {...defaultProps} className="custom-class" />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toHaveClass('custom-class');
  });

  it('renders label correctly', () => {
    render(<Textarea {...defaultProps} />);
    const label = screen.getByText('Test textarea');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for');
  });

  it('renders hint when provided', () => {
    render(<Textarea {...defaultProps} hint="This is a hint" />);
    const hint = screen.getByText('This is a hint');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveClass('text-[var(--color-text-muted)]');
  });

  it('renders error when provided', () => {
    render(<Textarea {...defaultProps} error="This is an error" />);
    const error = screen.getByText('This is an error');
    expect(error).toBeInTheDocument();
    expect(error).toHaveClass('text-red-600');
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('renders required asterisk when required', () => {
    render(<Textarea {...defaultProps} required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles value correctly', () => {
    render(<Textarea {...defaultProps} value="Test content" />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toHaveValue('Test content');
  });

  it('handles disabled state', () => {
    render(<Textarea {...defaultProps} disabled />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:opacity-60');

    // Label should also reflect disabled state
    const label = screen.getByText('Test textarea');
    expect(label).toHaveClass('opacity-60');
  });

  it('handles invalid state', () => {
    render(<Textarea {...defaultProps} invalid />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toHaveClass('border-red-500');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles error state', () => {
    render(<Textarea {...defaultProps} error="Error message" />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toHaveClass('border-red-500');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles onChange event', () => {
    const handleChange = jest.fn();
    render(<Textarea {...defaultProps} onChange={handleChange} />);

    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    fireEvent.change(textarea, { target: { value: 'New text' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'New text' })
      })
    );
  });

  it('renders with custom rows', () => {
    render(<Textarea {...defaultProps} rows={10} />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toHaveAttribute('rows', '10');
  });

  it('defaults to 6 rows when not specified', () => {
    render(<Textarea {...defaultProps} />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('has resize-y class by default', () => {
    render(<Textarea {...defaultProps} />);
    const textarea = screen.getByRole('textbox', { name: /test textarea/i });
    expect(textarea).toHaveClass('resize-y');
  });

  describe('accessibility', () => {
    it('has correct aria attributes', () => {
      render(<Textarea {...defaultProps} required error="Error" />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });

      expect(textarea).toHaveAttribute('aria-required', 'true');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby');
    });

    it('generates unique id automatically', () => {
      render(<Textarea {...defaultProps} />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });
      const label = screen.getByText('Test textarea');

      expect(textarea).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', textarea.getAttribute('id'));
    });

    it('uses custom id when provided', () => {
      render(<Textarea {...defaultProps} id="custom-id" />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });
      const label = screen.getByText('Test textarea');

      expect(textarea).toHaveAttribute('id', 'custom-id');
      expect(label).toHaveAttribute('for', 'custom-id');
    });

    it('links hint to textarea with aria-describedby', () => {
      render(<Textarea {...defaultProps} hint="Help text" />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });
      const hint = screen.getByText('Help text');

      expect(hint).toHaveAttribute('id');
      expect(textarea).toHaveAttribute('aria-describedby', hint.getAttribute('id'));
    });

    it('links error to textarea with aria-describedby', () => {
      render(<Textarea {...defaultProps} error="Error message" />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });
      const error = screen.getByText('Error message');

      expect(error).toHaveAttribute('id');
      expect(textarea).toHaveAttribute('aria-describedby', error.getAttribute('id'));
    });
  });

  describe('forwardRef', () => {
    it('forwards ref to textarea element', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current).toHaveAttribute('type', undefined); // textarea doesn't have type attribute
    });
  });

  describe('React.memo optimization', () => {
    it('is memoized', () => {
      expect(Textarea).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('has displayName', () => {
      expect(Textarea.displayName).toBe('Textarea');
    });
  });

  describe('containerClassName', () => {
    it('applies custom container class', () => {
      render(<Textarea {...defaultProps} containerClassName="custom-container" />);
      const container = screen.getByRole('textbox', { name: /test textarea/i }).closest('div');
      expect(container).toHaveClass('custom-container');
    });
  });

  describe('placeholder', () => {
    it('renders placeholder text', () => {
      render(<Textarea {...defaultProps} placeholder="Custom placeholder" />);
      const textarea = screen.getByPlaceholderText('Custom placeholder');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('multiline text', () => {
    it('handles multiline value correctly', () => {
      const multilineValue = `Line 1
Line 2
Line 3`;
      render(<Textarea {...defaultProps} value={multilineValue} />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });
      expect(textarea).toHaveValue(multilineValue);
    });
  });

  describe('maxLength', () => {
    it('respects maxLength attribute', () => {
      render(<Textarea {...defaultProps} maxLength={10} />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });
      expect(textarea).toHaveAttribute('maxLength', '10');
    });
  });

  describe('readOnly', () => {
    it('handles readOnly attribute', () => {
      render(<Textarea {...defaultProps} readOnly />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });
      expect(textarea).toHaveAttribute('readonly');
    });
  });

  describe('spellCheck', () => {
    it('handles spellCheck attribute', () => {
      render(<Textarea {...defaultProps} spellCheck={false} />);
      const textarea = screen.getByRole('textbox', { name: /test textarea/i });
      expect(textarea).toHaveAttribute('spellcheck', 'false');
    });
  });
});
