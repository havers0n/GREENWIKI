import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BorderControl, BorderValue } from './BorderControl';

describe('BorderControl', () => {
  const defaultProps = {
    value: {
      width: '2px',
      color: '#333333',
    } as BorderValue,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<BorderControl {...defaultProps} />);
    expect(screen.getByLabelText('Толщина границы')).toBeInTheDocument();
    expect(screen.getByLabelText('Цвет границы')).toBeInTheDocument();
  });

  it('displays correct initial values', () => {
    render(<BorderControl {...defaultProps} />);
    expect(screen.getByDisplayValue('2px')).toBeInTheDocument(); // width
  });

  it('calls onChange when width changes', () => {
    render(<BorderControl {...defaultProps} />);
    const widthInput = screen.getByLabelText('Толщина границы');
    fireEvent.change(widthInput, { target: { value: '3px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      width: '3px',
      color: '#333333',
    });
  });

  it('shows style selector when showStyle is true', () => {
    render(<BorderControl {...defaultProps} showStyle={true} />);
    expect(screen.getByLabelText('Стиль границы')).toBeInTheDocument();
    expect(screen.getByText('Сплошная')).toBeInTheDocument();
    expect(screen.getByText('Пунктирная')).toBeInTheDocument();
    expect(screen.getByText('Точечная')).toBeInTheDocument();
  });

  it('does not show style selector when showStyle is false', () => {
    render(<BorderControl {...defaultProps} showStyle={false} />);
    expect(screen.queryByLabelText('Стиль границы')).not.toBeInTheDocument();
  });

  it('shows radius control when showRadius is true', () => {
    render(<BorderControl {...defaultProps} showRadius={true} />);
    expect(screen.getByLabelText('Радиус скругления')).toBeInTheDocument();
  });

  it('does not show radius control when showRadius is false', () => {
    render(<BorderControl {...defaultProps} showRadius={false} />);
    expect(screen.queryByLabelText('Радиус скругления')).not.toBeInTheDocument();
  });

  it('handles style selection correctly', () => {
    const withStyle = {
      ...defaultProps,
      value: { ...defaultProps.value, style: 'solid' },
      showStyle: true,
    };

    render(<BorderControl {...withStyle} />);
    const styleSelect = screen.getByLabelText('Стиль границы');
    fireEvent.change(styleSelect, { target: { value: 'dashed' } });

    expect(withStyle.onChange).toHaveBeenCalledWith({
      width: '2px',
      color: '#333333',
      style: 'dashed',
    });
  });

  it('handles radius input correctly', () => {
    render(<BorderControl {...defaultProps} showRadius={true} />);
    const radiusInput = screen.getByLabelText('Радиус скругления');
    fireEvent.change(radiusInput, { target: { value: '8px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      width: '2px',
      color: '#333333',
      radius: '8px',
    });
  });

  it('shows linked status by default', () => {
    render(<BorderControl {...defaultProps} />);
    expect(screen.getByText('Границы связаны')).toBeInTheDocument();
  });

  it('toggles linked state when link button is clicked', () => {
    render(<BorderControl {...defaultProps} />);
    const linkButton = screen.getByLabelText('Разорвать связь между значениями');
    fireEvent.click(linkButton);

    expect(screen.getByText('Границы независимы')).toBeInTheDocument();
    expect(screen.getByLabelText('Связать все значения')).toBeInTheDocument();
  });

  it('handles empty values correctly', () => {
    const emptyValue = {} as BorderValue;
    render(<BorderControl value={emptyValue} onChange={jest.fn()} />);

    // Should handle undefined values gracefully
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('handles partial values correctly', () => {
    const partialValue = { width: '2px' } as BorderValue;
    render(<BorderControl value={partialValue} onChange={jest.fn()} />);

    expect(screen.getByDisplayValue('2px')).toBeInTheDocument();
  });

  it('applies disabled state correctly', () => {
    render(<BorderControl {...defaultProps} disabled={true} showStyle={true} showRadius={true} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });

    const selects = screen.getAllByRole('combobox');
    selects.forEach(select => {
      expect(select).toBeDisabled();
    });

    const linkButton = screen.getByLabelText('Разорвать связь между значениями');
    expect(linkButton).toBeDisabled();
  });

  it('does not call onChange when disabled', () => {
    render(<BorderControl {...defaultProps} disabled={true} />);
    const widthInput = screen.getByLabelText('Толщина границы');
    fireEvent.change(widthInput, { target: { value: '3px' } });

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<BorderControl {...defaultProps} className="custom-class" />);
    const container = screen.getByLabelText('Толщина границы').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<BorderControl {...defaultProps} />);
    const widthInput = screen.getByLabelText('Толщина границы');

    expect(widthInput).toHaveAttribute('aria-label', 'Толщина границы');
  });

  it('renders visual element representation', () => {
    render(<BorderControl {...defaultProps} />);
    // Check that there's a visual element in the preview area
    const container = screen.getByLabelText('Толщина границы').closest('.space-y-4');
    expect(container).toBeInTheDocument();
  });

  it('handles different border styles', () => {
    const styles: Array<'solid' | 'dashed' | 'dotted'> = ['solid', 'dashed', 'dotted'];

    styles.forEach(style => {
      const withStyle = {
        ...defaultProps,
        value: { ...defaultProps.value, style },
        showStyle: true,
      };

      const { rerender } = render(<BorderControl {...withStyle} />);
      const styleSelect = screen.getByLabelText('Стиль границы');

      // The select should have the correct value
      expect(styleSelect).toHaveValue(style);

      rerender(<BorderControl {...defaultProps} />);
    });
  });

  it('maintains visual consistency with different values', () => {
    const differentValues = [
      { width: '1px', color: '#ff0000' },
      { width: '5px', color: '#00ff00' },
      { width: '10px', color: '#0000ff', radius: '20px' },
    ];

    differentValues.forEach(value => {
      const { rerender } = render(<BorderControl value={value} onChange={jest.fn()} />);
      const widthInput = screen.getByLabelText('Толщина границы');

      expect(widthInput).toHaveValue(value.width);

      rerender(<BorderControl value={defaultProps.value} onChange={jest.fn()} />);
    });
  });

  it('handles color picker integration', () => {
    render(<BorderControl {...defaultProps} />);
    // The color picker is a separate component, so we just check that
    // the color input exists (it should be rendered by EnhancedColorPicker)
    const colorLabel = screen.getByLabelText('Цвет границы');
    expect(colorLabel).toBeInTheDocument();
  });

  it('shows border style preview when showStyle is true', () => {
    render(<BorderControl {...defaultProps} showStyle={true} />);
    expect(screen.getByText('Предпросмотр стилей:')).toBeInTheDocument();
  });

  it('does not show border style preview when showStyle is false', () => {
    render(<BorderControl {...defaultProps} showStyle={false} />);
    expect(screen.queryByText('Предпросмотр стилей:')).not.toBeInTheDocument();
  });
});
