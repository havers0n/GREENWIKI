import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DimensionControl, DimensionValue } from './DimensionControl';

describe('DimensionControl', () => {
  const defaultProps = {
    value: {
      width: '200px',
      height: '100px',
    } as DimensionValue,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<DimensionControl {...defaultProps} />);
    expect(screen.getByLabelText('Ширина')).toBeInTheDocument();
    expect(screen.getByLabelText('Высота')).toBeInTheDocument();
  });

  it('displays correct initial values', () => {
    render(<DimensionControl {...defaultProps} />);
    expect(screen.getByDisplayValue('200px')).toBeInTheDocument(); // width
    expect(screen.getByDisplayValue('100px')).toBeInTheDocument(); // height
  });

  it('calls onChange when width changes', () => {
    render(<DimensionControl {...defaultProps} />);
    const widthInput = screen.getByLabelText('Ширина');
    fireEvent.change(widthInput, { target: { value: '300px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      width: '300px',
      height: '100px',
    });
  });

  it('calls onChange when height changes', () => {
    render(<DimensionControl {...defaultProps} />);
    const heightInput = screen.getByLabelText('Высота');
    fireEvent.change(heightInput, { target: { value: '150px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      width: '200px',
      height: '150px',
    });
  });

  it('does not show constraints by default', () => {
    render(<DimensionControl {...defaultProps} />);
    expect(screen.queryByLabelText('Минимальная ширина')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Максимальная ширина')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Минимальная высота')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Максимальная высота')).not.toBeInTheDocument();
  });

  it('shows constraints when showConstraints is true', () => {
    render(<DimensionControl {...defaultProps} showConstraints={true} />);
    expect(screen.getByLabelText('Минимальная ширина')).toBeInTheDocument();
    expect(screen.getByLabelText('Максимальная ширина')).toBeInTheDocument();
    expect(screen.getByLabelText('Минимальная высота')).toBeInTheDocument();
    expect(screen.getByLabelText('Максимальная высота')).toBeInTheDocument();
  });

  it('handles constraint values correctly', () => {
    const withConstraints = {
      ...defaultProps,
      value: {
        ...defaultProps.value,
        minWidth: '100px',
        maxWidth: '500px',
        minHeight: '50px',
        maxHeight: '300px',
      },
      showConstraints: true,
    };

    render(<DimensionControl {...withConstraints} />);

    const minWidthInput = screen.getByLabelText('Минимальная ширина');
    fireEvent.change(minWidthInput, { target: { value: '150px' } });

    expect(withConstraints.onChange).toHaveBeenCalledWith({
      width: '200px',
      height: '100px',
      minWidth: '150px',
      maxWidth: '500px',
      minHeight: '50px',
      maxHeight: '300px',
    });
  });

  it('handles empty values correctly', () => {
    const emptyValue = {} as DimensionValue;
    render(<DimensionControl value={emptyValue} onChange={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('handles partial values correctly', () => {
    const partialValue = { width: '200px' } as DimensionValue;
    render(<DimensionControl value={partialValue} onChange={jest.fn()} />);

    expect(screen.getByDisplayValue('200px')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    const nonWidthInputs = inputs.filter(input => input !== screen.getByDisplayValue('200px'));
    nonWidthInputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('applies disabled state correctly', () => {
    render(<DimensionControl {...defaultProps} disabled={true} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('does not call onChange when disabled', () => {
    render(<DimensionControl {...defaultProps} disabled={true} />);
    const widthInput = screen.getByLabelText('Ширина');
    fireEvent.change(widthInput, { target: { value: '300px' } });

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<DimensionControl {...defaultProps} className="custom-class" />);
    const container = screen.getByLabelText('Ширина').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<DimensionControl {...defaultProps} />);
    const widthInput = screen.getByLabelText('Ширина');
    const heightInput = screen.getByLabelText('Высота');

    expect(widthInput).toHaveAttribute('aria-label', 'Ширина');
    expect(heightInput).toHaveAttribute('aria-label', 'Высота');
  });

  it('renders visual element representation', () => {
    render(<DimensionControl {...defaultProps} />);
    // Check that there's a visual element in the preview area
    const container = screen.getByLabelText('Ширина').closest('.space-y-4');
    expect(container).toBeInTheDocument();
  });

  it('handles different CSS units', () => {
    const unitsValue = {
      width: '50%',
      height: '200px',
      minWidth: '10rem',
      maxWidth: '100vw',
    } as DimensionValue;

    render(<DimensionControl value={unitsValue} onChange={jest.fn()} showConstraints={true} />);

    expect(screen.getByDisplayValue('50%')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200px')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10rem')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100vw')).toBeInTheDocument();
  });

  it('maintains correct structure with constraints', () => {
    render(<DimensionControl {...defaultProps} showConstraints={true} />);

    // Should have 6 input fields total (2 basic + 4 constraints)
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);

    // Check that constraint inputs are present
    expect(screen.getByLabelText('Минимальная ширина')).toBeInTheDocument();
    expect(screen.getByLabelText('Максимальная ширина')).toBeInTheDocument();
    expect(screen.getByLabelText('Минимальная высота')).toBeInTheDocument();
    expect(screen.getByLabelText('Максимальная высота')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<DimensionControl {...defaultProps} />);
    const widthInput = screen.getByLabelText('Ширина');

    widthInput.focus();
    expect(widthInput).toHaveFocus();

    // Tab to next input
    fireEvent.keyDown(widthInput, { key: 'Tab' });
    // Note: This test focuses on focus behavior, actual tab navigation
    // would require more complex testing setup
  });
});
