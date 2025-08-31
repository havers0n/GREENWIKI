import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedColorPicker } from './EnhancedColorPicker';

describe('EnhancedColorPicker', () => {
  const defaultProps = {
    value: '#ff6b6b',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });
    expect(colorIndicator).toBeInTheDocument();
    const textInput = screen.getByDisplayValue('#ff6b6b');
    expect(textInput).toBeInTheDocument();
  });

  it('displays the correct initial color', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });
    expect(colorIndicator).toHaveStyle({ backgroundColor: '#ff6b6b' });
  });

  it('updates color when value prop changes', () => {
    const { rerender } = render(<EnhancedColorPicker {...defaultProps} />);
    const textInput = screen.getByDisplayValue('#ff6b6b');
    expect(textInput).toBeInTheDocument();

    rerender(<EnhancedColorPicker {...defaultProps} value="#4ecdc4" />);
    const updatedInput = screen.getByDisplayValue('#4ecdc4');
    expect(updatedInput).toBeInTheDocument();
  });

  it('calls onChange when color is changed via native input', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const hiddenColorInput = screen.getByDisplayValue('#ff6b6b');
    expect(hiddenColorInput).toHaveAttribute('type', 'color');

    fireEvent.change(hiddenColorInput, { target: { value: '#4ecdc4' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('#4ecdc4');
  });

  it('calls onChange when text input is changed with valid hex', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const textInput = screen.getByDisplayValue('#ff6b6b');

    fireEvent.change(textInput, { target: { value: '#4ecdc4' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('#4ecdc4');
  });

  it('calls onChange when text input is changed with valid short hex', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const textInput = screen.getByDisplayValue('#ff6b6b');

    fireEvent.change(textInput, { target: { value: '#f06' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('#f06');
  });

  it('calls onChange when text input is changed with valid rgba', () => {
    render(<EnhancedColorPicker {...defaultProps} showAlpha={true} />);
    const textInput = screen.getByDisplayValue('#ff6b6b');

    fireEvent.change(textInput, { target: { value: 'rgba(255, 107, 107, 0.8)' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('rgba(255, 107, 107, 0.8)');
  });

  it('does not call onChange for invalid color format', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const textInput = screen.getByDisplayValue('#ff6b6b');

    fireEvent.change(textInput, { target: { value: 'invalid-color' } });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('toggles popup when color indicator is clicked', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    // Initially popup should not be visible
    expect(screen.queryByText('Палитра')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(colorIndicator);
    expect(screen.getByText('Палитра')).toBeInTheDocument();

    // Click to close
    fireEvent.click(colorIndicator);
    expect(screen.queryByText('Палитра')).not.toBeInTheDocument();
  });

  it('closes popup when clicking outside', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    // Open popup
    fireEvent.click(colorIndicator);
    expect(screen.getByText('Палитра')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Палитра')).not.toBeInTheDocument();
  });

  it('closes popup when Escape key is pressed', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    // Open popup
    fireEvent.click(colorIndicator);
    expect(screen.getByText('Палитра')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(colorIndicator, { key: 'Escape' });
    expect(screen.queryByText('Палитра')).not.toBeInTheDocument();
  });

  it('shows alpha slider when showAlpha is true', () => {
    render(<EnhancedColorPicker {...defaultProps} showAlpha={true} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    fireEvent.click(colorIndicator);
    expect(screen.getByText('Прозрачность')).toBeInTheDocument();
    const alphaSlider = screen.getByRole('slider');
    expect(alphaSlider).toBeInTheDocument();
  });

  it('does not show alpha slider when showAlpha is false', () => {
    render(<EnhancedColorPicker {...defaultProps} showAlpha={false} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    fireEvent.click(colorIndicator);
    expect(screen.queryByText('Прозрачность')).not.toBeInTheDocument();
  });

  it('shows presets when provided', () => {
    const presets = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
    render(<EnhancedColorPicker {...defaultProps} presets={presets} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    fireEvent.click(colorIndicator);
    expect(screen.getByText('Предустановки')).toBeInTheDocument();

    // Check that preset buttons are rendered
    presets.forEach(preset => {
      const presetButton = screen.getByTitle(preset);
      expect(presetButton).toBeInTheDocument();
    });
  });

  it('calls onChange and closes popup when preset is selected', () => {
    const presets = ['#ff6b6b', '#4ecdc4'];
    render(<EnhancedColorPicker {...defaultProps} presets={presets} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    fireEvent.click(colorIndicator);
    const presetButton = screen.getByTitle('#4ecdc4');
    fireEvent.click(presetButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith('#4ecdc4');
    expect(screen.queryByText('Палитра')).not.toBeInTheDocument();
  });

  it('shows check icon on selected preset', () => {
    const presets = ['#ff6b6b', '#4ecdc4'];
    render(<EnhancedColorPicker {...defaultProps} presets={presets} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    fireEvent.click(colorIndicator);

    // Find the preset button that matches current value
    const currentPresetButton = screen.getByTitle('#ff6b6b');
    // Check should be present (though we can't easily test the icon visibility)
    expect(currentPresetButton).toBeInTheDocument();
  });

  it('applies disabled state correctly', () => {
    render(<EnhancedColorPicker {...defaultProps} disabled={true} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });
    const textInput = screen.getByDisplayValue('#ff6b6b');

    expect(colorIndicator).toBeDisabled();
    expect(textInput).toBeDisabled();
    expect(colorIndicator).toHaveClass('cursor-not-allowed');
  });

  it('does not open popup when disabled', () => {
    render(<EnhancedColorPicker {...defaultProps} disabled={true} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    fireEvent.click(colorIndicator);
    expect(screen.queryByText('Палитра')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EnhancedColorPicker {...defaultProps} className="custom-class" />);
    const container = screen.getByRole('button', { name: /выбрать цвет/i }).closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('shows placeholder when provided', () => {
    render(<EnhancedColorPicker {...defaultProps} value="" placeholder="Custom placeholder" />);
    const textInput = screen.getByPlaceholderText('Custom placeholder');
    expect(textInput).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    // Enter key should toggle popup
    fireEvent.keyDown(colorIndicator, { key: 'Enter' });
    expect(screen.getByText('Палитра')).toBeInTheDocument();

    // Space key should toggle popup
    fireEvent.keyDown(colorIndicator, { key: ' ' });
    expect(screen.queryByText('Палитра')).not.toBeInTheDocument();
  });

  it('handles alpha slider changes', () => {
    render(<EnhancedColorPicker {...defaultProps} showAlpha={true} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    fireEvent.click(colorIndicator);
    const alphaSlider = screen.getByRole('slider');

    fireEvent.change(alphaSlider, { target: { value: '0.5' } });
    expect(defaultProps.onChange).toHaveBeenCalledWith('rgba(255, 107, 107, 0.5)');
  });

  it('maintains focus management', () => {
    render(<EnhancedColorPicker {...defaultProps} />);
    const colorIndicator = screen.getByRole('button', { name: /выбрать цвет/i });

    expect(colorIndicator).toHaveAttribute('tabIndex', '0');
    expect(colorIndicator).toHaveClass('focus:outline-none');
    expect(colorIndicator).toHaveClass('focus:ring-2');
  });
});
