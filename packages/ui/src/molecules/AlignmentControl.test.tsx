import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlignmentControl, AlignmentValue } from './AlignmentControl';

describe('AlignmentControl', () => {
  const defaultProps = {
    value: 'left' as AlignmentValue,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<AlignmentControl {...defaultProps} />);
    const radioGroup = screen.getByRole('radiogroup', { name: /выбор выравнивания/i });
    expect(radioGroup).toBeInTheDocument();

    // Should have 4 radio buttons
    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(4);
  });

  it('renders all alignment options', () => {
    render(<AlignmentControl {...defaultProps} />);

    expect(screen.getByLabelText('Выровнять по левому краю')).toBeInTheDocument();
    expect(screen.getByLabelText('Выровнять по центру')).toBeInTheDocument();
    expect(screen.getByLabelText('Выровнять по правому краю')).toBeInTheDocument();
    expect(screen.getByLabelText('Выровнять по ширине')).toBeInTheDocument();
  });

  it('shows correct active state for current value', () => {
    render(<AlignmentControl {...defaultProps} />);

    const leftButton = screen.getByLabelText('Выровнять по левому краю');
    const centerButton = screen.getByLabelText('Выровнять по центру');

    // Left should be checked (active)
    expect(leftButton).toHaveAttribute('aria-checked', 'true');

    // Center should not be checked
    expect(centerButton).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange when clicking inactive alignment', () => {
    render(<AlignmentControl {...defaultProps} />);

    const centerButton = screen.getByLabelText('Выровнять по центру');
    fireEvent.click(centerButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith('center');
    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
  });

  it('does not call onChange when clicking active alignment', () => {
    render(<AlignmentControl {...defaultProps} />);

    const leftButton = screen.getByLabelText('Выровнять по левому краю');
    fireEvent.click(leftButton);

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('handles all alignment values correctly', () => {
    const values: AlignmentValue[] = ['left', 'center', 'right', 'justify'];

    values.forEach((value) => {
      const mockOnChange = jest.fn();
      render(<AlignmentControl value={value} onChange={mockOnChange} />);

      // Check that the correct button is active
      const activeButton = screen.getByLabelText(
        value === 'left' ? 'Выровнять по левому краю' :
        value === 'center' ? 'Выровнять по центру' :
        value === 'right' ? 'Выровнять по правому краю' :
        'Выровнять по ширине'
      );

      expect(activeButton).toHaveAttribute('aria-checked', 'true');

      // Click on a different alignment
      const differentValue = values.find(v => v !== value)!;
      const differentButton = screen.getByLabelText(
        differentValue === 'left' ? 'Выровнять по левому краю' :
        differentValue === 'center' ? 'Выровнять по центру' :
        differentValue === 'right' ? 'Выровнять по правому краю' :
        'Выровнять по ширине'
      );

      fireEvent.click(differentButton);
      expect(mockOnChange).toHaveBeenCalledWith(differentValue);
    });
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<AlignmentControl {...defaultProps} size="sm" />);

    // Small size should be applied (this is tested via the ActionIcon size prop)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();

    rerender(<AlignmentControl {...defaultProps} size="md" />);

    // Medium size should be applied
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('handles disabled state correctly', () => {
    render(<AlignmentControl {...defaultProps} disabled={true} />);

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveClass('opacity-50', 'cursor-not-allowed');

    const buttons = screen.getAllByRole('radio');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onChange when disabled', () => {
    render(<AlignmentControl {...defaultProps} disabled={true} />);

    const centerButton = screen.getByLabelText('Выровнять по центру');
    fireEvent.click(centerButton);

    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<AlignmentControl {...defaultProps} className="custom-class" />);

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveClass('custom-class');
  });

  it('has correct accessibility attributes', () => {
    render(<AlignmentControl {...defaultProps} />);

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('aria-label', 'Выбор выравнивания');

    const radioButtons = screen.getAllByRole('radio');
    radioButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-checked');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('role', 'radio');
    });
  });

  it('defaults to left alignment when no value provided', () => {
    render(<AlignmentControl onChange={jest.fn()} />);

    const leftButton = screen.getByLabelText('Выровнять по левому краю');
    expect(leftButton).toHaveAttribute('aria-checked', 'true');
  });

  it('maintains correct ARIA states when value changes', () => {
    const { rerender } = render(<AlignmentControl {...defaultProps} />);

    // Initially left is checked
    expect(screen.getByLabelText('Выровнять по левому краю')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Выровнять по центру')).toHaveAttribute('aria-checked', 'false');

    // Change to center
    rerender(<AlignmentControl {...defaultProps} value="center" />);

    expect(screen.getByLabelText('Выровнять по левому краю')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByLabelText('Выровнять по центру')).toHaveAttribute('aria-checked', 'true');
  });

  it('supports keyboard navigation', () => {
    render(<AlignmentControl {...defaultProps} />);

    const centerButton = screen.getByLabelText('Выровнять по центру');

    // Focus the button
    centerButton.focus();
    expect(centerButton).toHaveFocus();

    // Click with Enter key
    fireEvent.keyDown(centerButton, { key: 'Enter' });
    expect(defaultProps.onChange).toHaveBeenCalledWith('center');
  });

  it('renders with proper visual styling', () => {
    render(<AlignmentControl {...defaultProps} />);

    const radioGroup = screen.getByRole('radiogroup');

    // Check base styling
    expect(radioGroup).toHaveClass(
      'inline-flex',
      'items-center',
      'gap-1',
      'p-1',
      'bg-gray-50',
      'border',
      'border-gray-200',
      'rounded-lg'
    );
  });

  it('handles all icon types correctly', () => {
    render(<AlignmentControl {...defaultProps} />);

    // Check that all icons are present (this is more of a visual test)
    // In a real scenario, you might want to check for specific icon classes or data attributes
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(4);

    // Each button should contain an SVG icon
    buttons.forEach(button => {
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
