import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, InputSize } from './Input';

describe('Input', () => {
  const defaultProps = {
    placeholder: 'Enter text',
  };

  it('renders with default props', () => {
    render(<Input {...defaultProps} />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with custom className', () => {
    render(<Input {...defaultProps} className="custom-class" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toHaveClass('custom-class');
  });

  it('renders with container className', () => {
    render(<Input {...defaultProps} containerClassName="container-class" />);
    const container = screen.getByPlaceholderText('Enter text').parentElement;
    expect(container).toHaveClass('container-class');
  });

  describe('sizes', () => {
    it.each([
      ['sm', 'text-sm px-3 py-1.5'],
      ['md', 'text-sm px-4 py-2'],
      ['lg', 'text-base px-5 py-2.5'],
    ])('renders %s size correctly', (size, expectedClasses) => {
      render(<Input {...defaultProps} size={size as InputSize} />);
      const input = screen.getByPlaceholderText('Enter text');

      expectedClasses.split(' ').forEach(className => {
        expect(input).toHaveClass(className);
      });
    });
  });

  describe('label', () => {
    it('renders label when provided', () => {
      render(<Input {...defaultProps} label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for');
    });

    it('connects label to input with correct id', () => {
      render(<Input {...defaultProps} label="Test Label" id="test-input" />);
      const label = screen.getByText('Test Label');
      const input = screen.getByPlaceholderText('Enter text');

      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('generates unique ids when no id provided', () => {
      const { rerender } = render(<Input {...defaultProps} label="First" />);
      const firstLabel = screen.getByText('First');
      const firstInput = screen.getByPlaceholderText('Enter text');

      const firstId = firstInput.getAttribute('id');
      expect(firstLabel).toHaveAttribute('for', firstId);

      rerender(<Input {...defaultProps} label="Second" />);
      const secondLabel = screen.getByText('Second');
      const secondInput = screen.getByPlaceholderText('Enter text');

      const secondId = secondInput.getAttribute('id');
      expect(secondLabel).toHaveAttribute('for', secondId);
      expect(firstId).not.toBe(secondId);
    });
  });

  describe('required', () => {
    it('shows required indicator when required is true', () => {
      render(<Input {...defaultProps} label="Required Field" required />);
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveAttribute('aria-hidden', 'true');
    });

    it('sets aria-required attribute', () => {
      render(<Input {...defaultProps} required />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('does not show required indicator when required is false', () => {
      render(<Input {...defaultProps} label="Optional Field" required={false} />);
      const asterisk = screen.queryByText('*');
      expect(asterisk).not.toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('renders disabled state correctly', () => {
      render(<Input {...defaultProps} disabled />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeDisabled();
    });

    it('renders error state when error prop is provided', () => {
      render(<Input {...defaultProps} error="This field is required" />);
      const input = screen.getByPlaceholderText('Enter text');
      const errorMessage = screen.getByText('This field is required');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('renders error state when invalid prop is true', () => {
      render(<Input {...defaultProps} invalid />);
      const input = screen.getByPlaceholderText('Enter text');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('prioritizes error over hint', () => {
      render(
        <Input
          {...defaultProps}
          hint="This is a hint"
          error="This is an error"
        />
      );

      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.queryByText('This is a hint')).not.toBeInTheDocument();
    });
  });

  describe('hint and error messages', () => {
    it('renders hint when provided and no error', () => {
      render(<Input {...defaultProps} hint="This is a helpful hint" />);
      const hint = screen.getByText('This is a helpful hint');
      expect(hint).toBeInTheDocument();
    });

    it('connects messages to input with aria-describedby', () => {
      render(<Input {...defaultProps} hint="Help text" />);
      const input = screen.getByPlaceholderText('Enter text');
      const hint = screen.getByText('Help text');

      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(hint).toHaveAttribute('id', describedBy);
    });

    it('does not set aria-describedby when no hint or error', () => {
      render(<Input {...defaultProps} />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('events', () => {
    it('calls onChange when input value changes', () => {
      const onChange = jest.fn();
      render(<Input {...defaultProps} onChange={onChange} />);

      const input = screen.getByPlaceholderText('Enter text');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus when input receives focus', () => {
      const onFocus = jest.fn();
      render(<Input {...defaultProps} onFocus={onFocus} />);

      const input = screen.getByPlaceholderText('Enter text');
      fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      render(<Input {...defaultProps} onBlur={onBlur} />);

      const input = screen.getByPlaceholderText('Enter text');
      fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has correct default aria-invalid value', () => {
      render(<Input {...defaultProps} />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('sets aria-invalid to true when error is present', () => {
      render(<Input {...defaultProps} error="Error message" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid to true when invalid is true', () => {
      render(<Input {...defaultProps} invalid />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-required when required is false', () => {
      render(<Input {...defaultProps} required={false} />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).not.toHaveAttribute('aria-required');
    });
  });

  describe('forwardRef', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input {...defaultProps} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('input types', () => {
    it.each([
      'email',
      'password',
      'number',
      'tel',
      'url',
      'search',
    ])('renders with type="%s"', (type) => {
      render(<Input {...defaultProps} type={type} />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toHaveAttribute('type', type);
    });
  });

  describe('React.memo', () => {
    it('is wrapped with React.memo for performance', () => {
      expect(Input).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });
  });
});
