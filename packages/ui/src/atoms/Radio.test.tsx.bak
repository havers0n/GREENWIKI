import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Radio } from './Radio';

describe('Radio', () => {
  const defaultProps = {
    label: 'Test radio',
    name: 'test-radio',
  };

  it('renders with default props', () => {
    render(<Radio {...defaultProps} />);
    const radio = screen.getByRole('radio', { name: /test radio/i });
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveClass('rounded-full');
    expect(radio).toHaveClass('border-[var(--color-border-default)]');
  });

  it('renders with custom className', () => {
    render(<Radio {...defaultProps} className="custom-class" />);
    const radio = screen.getByRole('radio', { name: /test radio/i });
    expect(radio).toHaveClass('custom-class');
  });

  it('renders label correctly', () => {
    render(<Radio {...defaultProps} />);
    const label = screen.getByText('Test radio');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for');
  });

  it('renders hint when provided', () => {
    render(<Radio {...defaultProps} hint="This is a hint" />);
    const hint = screen.getByText('This is a hint');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveClass('text-[var(--color-text-muted)]');
  });

  it('renders error when provided', () => {
    render(<Radio {...defaultProps} error="This is an error" />);
    const error = screen.getByText('This is an error');
    expect(error).toBeInTheDocument();
    expect(error).toHaveClass('text-red-600');
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('renders required asterisk when required', () => {
    render(<Radio {...defaultProps} required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles checked state', () => {
    render(<Radio {...defaultProps} checked />);
    const radio = screen.getByRole('radio', { name: /test radio/i });
    expect(radio).toBeChecked();
  });

  it('handles disabled state', () => {
    render(<Radio {...defaultProps} disabled />);
    const radio = screen.getByRole('radio', { name: /test radio/i });
    expect(radio).toBeDisabled();
    expect(radio).toHaveClass('disabled:opacity-60');

    // Label should also reflect disabled state
    const label = screen.getByText('Test radio');
    expect(label).toHaveClass('opacity-60');
  });

  it('handles invalid state', () => {
    render(<Radio {...defaultProps} invalid />);
    const radio = screen.getByRole('radio', { name: /test radio/i });
    expect(radio).toHaveClass('border-red-500');
    expect(radio).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles error state', () => {
    render(<Radio {...defaultProps} error="Error message" />);
    const radio = screen.getByRole('radio', { name: /test radio/i });
    expect(radio).toHaveClass('border-red-500');
    expect(radio).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles onChange event', () => {
    const handleChange = jest.fn();
    render(<Radio {...defaultProps} onChange={handleChange} />);

    const radio = screen.getByRole('radio', { name: /test radio/i });
    fireEvent.click(radio);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles onChange via label click', () => {
    const handleChange = jest.fn();
    render(<Radio {...defaultProps} onChange={handleChange} />);

    const label = screen.getByText('Test radio');
    fireEvent.click(label);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  describe('accessibility', () => {
    it('has correct aria attributes', () => {
      render(<Radio {...defaultProps} required error="Error" />);
      const radio = screen.getByRole('radio', { name: /test radio/i });

      expect(radio).toHaveAttribute('aria-required', 'true');
      expect(radio).toHaveAttribute('aria-invalid', 'true');
      expect(radio).toHaveAttribute('aria-describedby');
    });

    it('generates unique id automatically', () => {
      render(<Radio {...defaultProps} />);
      const radio = screen.getByRole('radio', { name: /test radio/i });
      const label = screen.getByText('Test radio');

      expect(radio).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', radio.getAttribute('id'));
    });

    it('uses custom id when provided', () => {
      render(<Radio {...defaultProps} id="custom-id" />);
      const radio = screen.getByRole('radio', { name: /test radio/i });
      const label = screen.getByText('Test radio');

      expect(radio).toHaveAttribute('id', 'custom-id');
      expect(label).toHaveAttribute('for', 'custom-id');
    });

    it('has correct role and attributes', () => {
      render(<Radio {...defaultProps} />);
      const radio = screen.getByRole('radio', { name: /test radio/i });

      expect(radio).toHaveAttribute('type', 'radio');
      expect(radio).toHaveAttribute('name', 'test-radio');
    });
  });

  describe('forwardRef', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Radio {...defaultProps} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current).toHaveAttribute('type', 'radio');
    });
  });

  describe('React.memo optimization', () => {
    it('is memoized', () => {
      expect(Radio).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('has displayName', () => {
      expect(Radio.displayName).toBe('Radio');
    });
  });
});
