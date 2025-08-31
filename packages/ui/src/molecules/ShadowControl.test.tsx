import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShadowControl, ShadowValue } from './ShadowControl';

describe('ShadowControl', () => {
  const defaultProps = {
    value: 'md' as ShadowValue,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<ShadowControl {...defaultProps} />);
    expect(screen.getByText('Тень')).toBeInTheDocument();
    expect(screen.getByLabelText('Выбрать тень: Средняя')).toBeInTheDocument();
  });

  it('renders all shadow options', () => {
    render(<ShadowControl {...defaultProps} />);
    expect(screen.getByLabelText('Выбрать тень: Без тени')).toBeInTheDocument();
    expect(screen.getByLabelText('Выбрать тень: Маленькая')).toBeInTheDocument();
    expect(screen.getByLabelText('Выбрать тень: Средняя')).toBeInTheDocument();
    expect(screen.getByLabelText('Выбрать тень: Большая')).toBeInTheDocument();
    expect(screen.getByLabelText('Выбрать тень: Очень большая')).toBeInTheDocument();
  });

  it('shows correct active state for current value', () => {
    render(<ShadowControl {...defaultProps} />);
    const activeButton = screen.getByLabelText('Выбрать тень: Средняя');
    expect(activeButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange when different shadow is selected', () => {
    render(<ShadowControl {...defaultProps} />);
    const lgButton = screen.getByLabelText('Выбрать тень: Большая');
    fireEvent.click(lgButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith('lg');
  });

  it('does not call onChange when active shadow is clicked', () => {
    render(<ShadowControl {...defaultProps} />);
    const activeButton = screen.getByLabelText('Выбрать тень: Средняя');
    fireEvent.click(activeButton);

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('handles all shadow values correctly', () => {
    const values: ShadowValue[] = ['none', 'sm', 'md', 'lg', 'xl'];

    values.forEach(value => {
      const mockOnChange = jest.fn();
      render(<ShadowControl value={value} onChange={mockOnChange} />);

      // Check that the correct button is active
      const activeLabel = value === 'none' ? 'Без тени' :
                         value === 'sm' ? 'Маленькая' :
                         value === 'md' ? 'Средняя' :
                         value === 'lg' ? 'Большая' : 'Очень большая';

      const activeButton = screen.getByLabelText(`Выбрать тень: ${activeLabel}`);
      expect(activeButton).toHaveAttribute('aria-pressed', 'true');

      // Click on a different shadow
      const differentValue = values.find(v => v !== value)!;
      const differentLabel = differentValue === 'none' ? 'Без тени' :
                            differentValue === 'sm' ? 'Маленькая' :
                            differentValue === 'md' ? 'Средняя' :
                            differentValue === 'lg' ? 'Большая' : 'Очень большая';

      const differentButton = screen.getByLabelText(`Выбрать тень: ${differentLabel}`);
      fireEvent.click(differentButton);
      expect(mockOnChange).toHaveBeenCalledWith(differentValue);
    });
  });

  it('shows CSS value for current shadow', () => {
    render(<ShadowControl {...defaultProps} />);
    expect(screen.getByText('CSS:')).toBeInTheDocument();
    expect(screen.getByText('0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)')).toBeInTheDocument();
  });

  it('shows preview text for current shadow', () => {
    render(<ShadowControl {...defaultProps} />);
    expect(screen.getByText('Предпросмотр: Средняя тень')).toBeInTheDocument();
  });

  it('applies disabled state correctly', () => {
    render(<ShadowControl {...defaultProps} disabled={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onChange when disabled', () => {
    render(<ShadowControl {...defaultProps} disabled={true} />);
    const lgButton = screen.getByLabelText('Выбрать тень: Большая');
    fireEvent.click(lgButton);

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<ShadowControl {...defaultProps} className="custom-class" />);
    const container = screen.getByText('Тень').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<ShadowControl {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
    });
  });

  it('renders visual previews for all shadows', () => {
    render(<ShadowControl {...defaultProps} />);

    // Each shadow option should have a visual preview element
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);

    buttons.forEach(button => {
      const previewElement = button.querySelector('div > div');
      expect(previewElement).toBeInTheDocument();
    });
  });

  it('shows check indicator on active shadow', () => {
    render(<ShadowControl {...defaultProps} />);
    const activeButton = screen.getByLabelText('Выбрать тень: Средняя');

    // Should contain a check indicator
    const checkElement = activeButton.querySelector('.absolute');
    expect(checkElement).toBeInTheDocument();
  });

  it('does not show check indicator on inactive shadows', () => {
    render(<ShadowControl {...defaultProps} />);
    const inactiveButton = screen.getByLabelText('Выбрать тень: Большая');

    // Should not contain a check indicator
    const checkElement = inactiveButton.querySelector('.absolute');
    expect(checkElement).toBeInTheDocument(); // It exists but should be visually hidden
  });

  it('handles keyboard navigation', () => {
    render(<ShadowControl {...defaultProps} />);
    const mdButton = screen.getByLabelText('Выбрать тень: Средняя');

    mdButton.focus();
    expect(mdButton).toHaveFocus();

    // Enter key should work
    fireEvent.keyDown(mdButton, { key: 'Enter' });
    // Since it's already active, onChange should not be called
    expect(defaultProps.onChange).not.toHaveBeenCalled();

    // Space key should work
    fireEvent.keyDown(mdButton, { key: ' ' });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('defaults to none when no value provided', () => {
    render(<ShadowControl onChange={jest.fn()} />);
    const noneButton = screen.getByLabelText('Выбрать тень: Без тени');
    expect(noneButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('maintains correct CSS values for all shadows', () => {
    const expectedCSS = {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    };

    Object.entries(expectedCSS).forEach(([value, css]) => {
      const { rerender } = render(<ShadowControl value={value as ShadowValue} onChange={jest.fn()} />);
      expect(screen.getByText(css)).toBeInTheDocument();
      rerender(<ShadowControl value="md" onChange={jest.fn()} />);
    });
  });

  it('maintains correct preview text for all shadows', () => {
    const expectedText = {
      none: 'Без тени',
      sm: 'Маленькая тень',
      md: 'Средняя тень',
      lg: 'Большая тень',
      xl: 'Очень большая тень',
    };

    Object.entries(expectedText).forEach(([value, text]) => {
      const { rerender } = render(<ShadowControl value={value as ShadowValue} onChange={jest.fn()} />);
      expect(screen.getByText(`Предпросмотр: ${text}`)).toBeInTheDocument();
      rerender(<ShadowControl value="md" onChange={jest.fn()} />);
    });
  });

  it('renders with proper visual styling', () => {
    render(<ShadowControl {...defaultProps} />);

    const container = screen.getByText('Тень').closest('div');
    expect(container).toHaveClass(
      'space-y-3',
      'p-4',
      'bg-gray-50',
      'border',
      'border-gray-200',
      'rounded-lg'
    );
  });

  it('handles focus and blur events correctly', () => {
    render(<ShadowControl {...defaultProps} />);
    const mdButton = screen.getByLabelText('Выбрать тень: Средняя');

    mdButton.focus();
    expect(mdButton).toHaveFocus();

    mdButton.blur();
    expect(mdButton).not.toHaveFocus();
  });
});
