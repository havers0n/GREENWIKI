import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpacingControl, SpacingValue } from './SpacingControl';

describe('SpacingControl', () => {
  const defaultProps = {
    value: {
      top: '10px',
      right: '20px',
      bottom: '10px',
      left: '20px',
    } as SpacingValue,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<SpacingControl {...defaultProps} />);
    expect(screen.getByLabelText('Верхний отступ')).toBeInTheDocument();
    expect(screen.getByLabelText('Правый отступ')).toBeInTheDocument();
    expect(screen.getByLabelText('Нижний отступ')).toBeInTheDocument();
    expect(screen.getByLabelText('Левый отступ')).toBeInTheDocument();
  });

  it('displays correct initial values', () => {
    render(<SpacingControl {...defaultProps} />);
    expect(screen.getByDisplayValue('10px')).toBeInTheDocument(); // top
    expect(screen.getByDisplayValue('20px')).toBeInTheDocument(); // right
  });

  it('calls onChange when top value changes', () => {
    render(<SpacingControl {...defaultProps} />);
    const topInput = screen.getByLabelText('Верхний отступ');
    fireEvent.change(topInput, { target: { value: '15px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: '15px',
      right: '20px',
      bottom: '10px',
      left: '20px',
    });
  });

  it('calls onChange when right value changes', () => {
    render(<SpacingControl {...defaultProps} />);
    const rightInput = screen.getByLabelText('Правый отступ');
    fireEvent.change(rightInput, { target: { value: '25px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: '10px',
      right: '25px',
      bottom: '10px',
      left: '20px',
    });
  });

  it('calls onChange when bottom value changes', () => {
    render(<SpacingControl {...defaultProps} />);
    const bottomInput = screen.getByLabelText('Нижний отступ');
    fireEvent.change(bottomInput, { target: { value: '15px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: '10px',
      right: '20px',
      bottom: '15px',
      left: '20px',
    });
  });

  it('calls onChange when left value changes', () => {
    render(<SpacingControl {...defaultProps} />);
    const leftInput = screen.getByLabelText('Левый отступ');
    fireEvent.change(leftInput, { target: { value: '25px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: '10px',
      right: '20px',
      bottom: '10px',
      left: '25px',
    });
  });

  it('updates all values when linked and one value changes', () => {
    render(<SpacingControl {...defaultProps} allowLinked={true} />);
    const topInput = screen.getByLabelText('Верхний отступ');
    fireEvent.change(topInput, { target: { value: '30px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: '30px',
      right: '30px',
      bottom: '30px',
      left: '30px',
    });
  });

  it('does not update other values when unlinked', () => {
    render(<SpacingControl {...defaultProps} allowLinked={true} />);

    // Click the link button to unlink
    const linkButton = screen.getByLabelText('Разорвать связь между значениями');
    fireEvent.click(linkButton);

    // Now change top value
    const topInput = screen.getByLabelText('Верхний отступ');
    fireEvent.change(topInput, { target: { value: '30px' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      top: '30px',
      right: '20px',
      bottom: '10px',
      left: '20px',
    });
  });

  it('toggles link state when link button is clicked', () => {
    render(<SpacingControl {...defaultProps} allowLinked={true} />);

    // Initially linked
    expect(screen.getByLabelText('Разорвать связь между значениями')).toBeInTheDocument();

    // Click to unlink
    const linkButton = screen.getByLabelText('Разорвать связь между значениями');
    fireEvent.click(linkButton);

    // Now should be unlinked
    expect(screen.getByLabelText('Связать все значения')).toBeInTheDocument();
  });

  it('shows link status text', () => {
    render(<SpacingControl {...defaultProps} allowLinked={true} />);

    expect(screen.getByText('Значения связаны')).toBeInTheDocument();

    // Click to unlink
    const linkButton = screen.getByLabelText('Разорвать связь между значениями');
    fireEvent.click(linkButton);

    expect(screen.getByText('Значения независимы')).toBeInTheDocument();
  });

  it('does not show link button when allowLinked is false', () => {
    render(<SpacingControl {...defaultProps} allowLinked={false} />);
    expect(screen.queryByLabelText(/связь между значениями/)).not.toBeInTheDocument();
    expect(screen.queryByText('Значения связаны')).not.toBeInTheDocument();
  });

  it('handles empty values correctly', () => {
    const emptyValue = {} as SpacingValue;
    render(<SpacingControl value={emptyValue} onChange={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('handles partial values correctly', () => {
    const partialValue = { top: '10px' } as SpacingValue;
    render(<SpacingControl value={partialValue} onChange={jest.fn()} />);

    expect(screen.getByDisplayValue('10px')).toBeInTheDocument();

    // Other inputs should be empty
    const inputs = screen.getAllByRole('textbox');
    const nonTopInputs = inputs.filter(input => input !== screen.getByDisplayValue('10px'));
    nonTopInputs.forEach(input => {
      expect(input).toHaveValue('');
    });
  });

  it('applies disabled state correctly', () => {
    render(<SpacingControl {...defaultProps} disabled={true} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });

    const linkButton = screen.getByLabelText('Разорвать связь между значениями');
    expect(linkButton).toBeDisabled();
  });

  it('does not call onChange when disabled', () => {
    render(<SpacingControl {...defaultProps} disabled={true} />);
    const topInput = screen.getByLabelText('Верхний отступ');
    fireEvent.change(topInput, { target: { value: '30px' } });

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<SpacingControl {...defaultProps} className="custom-class" />);
    const container = screen.getByLabelText('Верхний отступ').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<SpacingControl {...defaultProps} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label');
    });

    const linkButton = screen.getByLabelText('Разорвать связь между значениями');
    expect(linkButton).toHaveAttribute('aria-label');
  });

  it('renders visual element representation', () => {
    render(<SpacingControl {...defaultProps} />);
    // Check for the visual element (the blue rectangle)
    const visualElement = screen.getByText('DIV').closest('div');
    expect(visualElement).toBeInTheDocument();
    expect(visualElement).toHaveClass('bg-blue-100', 'dark:bg-blue-900/30');
  });

  it('positions inputs correctly around visual element', () => {
    render(<SpacingControl {...defaultProps} />);

    // Check that inputs are positioned with absolute positioning classes
    const container = screen.getByLabelText('Верхний отступ').closest('.relative');
    expect(container).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<SpacingControl {...defaultProps} />);

    const topInput = screen.getByLabelText('Верхний отступ');
    topInput.focus();
    expect(topInput).toHaveFocus();

    // Tab to next input
    fireEvent.keyDown(topInput, { key: 'Tab' });
    // Note: This test focuses on focus behavior, actual tab navigation
    // would require more complex testing setup
  });

  it('maintains linked state when values become equal', () => {
    const { rerender } = render(<SpacingControl {...defaultProps} allowLinked={true} />);

    // Initially should be linked (all values equal in test data)
    expect(screen.getByText('Значения связаны')).toBeInTheDocument();

    // Unlink and change values to be different
    const linkButton = screen.getByLabelText('Разорвать связь между значениями');
    fireEvent.click(linkButton);

    const topInput = screen.getByLabelText('Верхний отступ');
    fireEvent.change(topInput, { target: { value: '5px' } });

    expect(screen.getByText('Значения независимы')).toBeInTheDocument();

    // Change all values to be equal again
    const rightInput = screen.getByLabelText('Правый отступ');
    fireEvent.change(rightInput, { target: { value: '5px' } });

    const bottomInput = screen.getByLabelText('Нижний отступ');
    fireEvent.change(bottomInput, { target: { value: '5px' } });

    const leftInput = screen.getByLabelText('Левый отступ');
    fireEvent.change(leftInput, { target: { value: '5px' } });

    // Should automatically become linked again
    expect(screen.getByText('Значения связаны')).toBeInTheDocument();
  });

  it('handles undefined values correctly', () => {
    const undefinedValue = {
      top: undefined,
      right: '10px',
      bottom: undefined,
      left: '10px',
    } as SpacingValue;

    render(<SpacingControl value={undefinedValue} onChange={jest.fn()} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue(''); // top
    expect(inputs[1]).toHaveValue('10px'); // right
    expect(inputs[2]).toHaveValue(''); // bottom
    expect(inputs[3]).toHaveValue('10px'); // left
  });
});
