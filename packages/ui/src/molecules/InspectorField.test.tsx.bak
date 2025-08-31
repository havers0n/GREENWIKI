import React from 'react';
import { render, screen } from '@testing-library/react';
import { InspectorField } from './InspectorField';

// Mock React.cloneElement to test id assignment
const mockCloneElement = jest.spyOn(React, 'cloneElement');

describe('InspectorField', () => {
  const defaultProps = {
    label: 'Test Label',
    children: <input type="text" placeholder="Test input" />,
  };

  beforeEach(() => {
    mockCloneElement.mockClear();
    // Reset the mock to use original implementation
    mockCloneElement.mockImplementation(React.cloneElement);
  });

  afterAll(() => {
    mockCloneElement.mockRestore();
  });

  it('renders with default props', () => {
    render(<InspectorField {...defaultProps} />);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
    const input = screen.getByPlaceholderText('Test input');
    expect(input).toBeInTheDocument();
  });

  it('renders label with correct htmlFor attribute', () => {
    render(<InspectorField {...defaultProps} />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('htmlFor');
    const input = screen.getByPlaceholderText('Test input');
    expect(input).toHaveAttribute('id');
    expect(label.getAttribute('htmlFor')).toBe(input.getAttribute('id'));
  });

  it('renders hint when provided', () => {
    render(<InspectorField {...defaultProps} hint="This is a hint" />);
    const hint = screen.getByText('This is a hint');
    expect(hint).toBeInTheDocument();
    expect(hint.tagName).toBe('P');
    expect(hint).toHaveClass('text-sm', 'text-gray-500');
  });

  it('renders error when provided', () => {
    render(<InspectorField {...defaultProps} error="This is an error" />);
    const error = screen.getByText('This is an error');
    expect(error).toBeInTheDocument();
    expect(error.tagName).toBe('P');
    expect(error).toHaveClass('text-sm', 'text-red-600');
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('shows required asterisk when required is true', () => {
    render(<InspectorField {...defaultProps} required={true} />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-500', 'ml-1');
  });

  it('does not show required asterisk when required is false', () => {
    render(<InspectorField {...defaultProps} required={false} />);
    const asterisk = screen.queryByText('*');
    expect(asterisk).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InspectorField {...defaultProps} className="custom-class" />);
    const container = screen.getByText('Test Label').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('renders without label when label is not provided', () => {
    const { label, ...propsWithoutLabel } = defaultProps;
    render(<InspectorField {...propsWithoutLabel} />);
    const labelElement = screen.queryByRole('label');
    expect(labelElement).not.toBeInTheDocument();
    const input = screen.getByPlaceholderText('Test input');
    expect(input).toBeInTheDocument();
  });

  it('renders hint but not error when both are provided', () => {
    render(
      <InspectorField
        {...defaultProps}
        hint="This is a hint"
        error="This is an error"
      />
    );
    const hint = screen.getByText('This is a hint');
    expect(hint).toBeInTheDocument();
    const error = screen.queryByText('This is an error');
    expect(error).not.toBeInTheDocument();
  });

  it('renders only error when error is provided without hint', () => {
    render(<InspectorField {...defaultProps} error="This is an error" />);
    const error = screen.getByText('This is an error');
    expect(error).toBeInTheDocument();
    const hint = screen.queryByText('This is a hint');
    expect(hint).not.toBeInTheDocument();
  });

  it('passes id to children element', () => {
    render(<InspectorField {...defaultProps} />);
    const input = screen.getByPlaceholderText('Test input');
    expect(input).toHaveAttribute('id');
    expect(typeof input.getAttribute('id')).toBe('string');
    expect(input.getAttribute('id')).toHaveLength(8); // React.useId generates 8-character id
  });

  it('preserves existing className on children', () => {
    const childWithClass = (
      <input
        type="text"
        placeholder="Test input"
        className="existing-class"
      />
    );
    render(<InspectorField label="Test" children={childWithClass} />);
    const input = screen.getByPlaceholderText('Test input');
    expect(input).toHaveClass('existing-class');
    expect(input).toHaveClass('w-full'); // Should also have w-full from InspectorField
  });

  it('handles non-React element children gracefully', () => {
    const textChild = 'Just text';
    render(<InspectorField label="Test" children={textChild} />);
    const text = screen.getByText('Just text');
    expect(text).toBeInTheDocument();
  });

  it('generates unique ids for multiple instances', () => {
    render(
      <div>
        <InspectorField label="First" children={<input type="text" />} />
        <InspectorField label="Second" children={<input type="text" />} />
      </div>
    );
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);
    const firstInput = inputs[0];
    const secondInput = inputs[1];
    expect(firstInput).toHaveAttribute('id');
    expect(secondInput).toHaveAttribute('id');
    expect(firstInput.getAttribute('id')).not.toBe(secondInput.getAttribute('id'));
  });

  it('maintains proper spacing structure', () => {
    render(<InspectorField {...defaultProps} hint="Hint text" />);
    const container = screen.getByText('Test Label').closest('div');
    expect(container).toHaveClass('space-y-2');

    // Check that all elements are properly spaced
    const label = screen.getByText('Test Label');
    const input = screen.getByPlaceholderText('Test input');
    const hint = screen.getByText('Hint text');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(hint).toBeInTheDocument();
  });

  it('handles complex children with multiple elements', () => {
    const complexChild = (
      <div>
        <span>Prefix</span>
        <input type="text" placeholder="Complex input" />
        <span>Suffix</span>
      </div>
    );
    render(<InspectorField label="Complex" children={complexChild} />);
    expect(screen.getByText('Prefix')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Complex input')).toBeInTheDocument();
    expect(screen.getByText('Suffix')).toBeInTheDocument();
  });
});
