import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

describe('RadioGroup', () => {
  const defaultProps = {
    label: 'Test group',
    value: 'option2',
    onChange: jest.fn(),
    children: [
      <RadioGroupItem key="1" value="option1" label="Option 1" />,
      <RadioGroupItem key="2" value="option2" label="Option 2" />,
      <RadioGroupItem key="3" value="option3" label="Option 3" />,
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<RadioGroup {...defaultProps} />);
    const group = screen.getByRole('radiogroup', { name: /test group/i });
    expect(group).toBeInTheDocument();
  });

  it('renders label correctly', () => {
    render(<RadioGroup {...defaultProps} />);
    const label = screen.getByText('Test group');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LEGEND');
  });

  it('renders required asterisk when required', () => {
    render(<RadioGroup {...defaultProps} required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders error message when provided', () => {
    render(<RadioGroup {...defaultProps} error="This is an error" />);
    const error = screen.getByText('This is an error');
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('handles vertical orientation by default', () => {
    render(<RadioGroup {...defaultProps} />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveClass('space-y-2');
  });

  it('handles horizontal orientation', () => {
    render(<RadioGroup {...defaultProps} orientation="horizontal" />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveClass('flex');
    expect(group).toHaveClass('gap-4');
  });

  it('passes disabled state to children', () => {
    render(<RadioGroup {...defaultProps} disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toBeDisabled();
    });
  });

  it('passes error state to children', () => {
    render(<RadioGroup {...defaultProps} error="Error message" />);
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('calls onChange when radio is selected', () => {
    const mockOnChange = jest.fn();
    render(<RadioGroup {...defaultProps} onChange={mockOnChange} />);

    const option1 = screen.getByRole('radio', { name: /option 1/i });
    fireEvent.click(option1);

    expect(mockOnChange).toHaveBeenCalledWith('option1');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('correctly sets checked state based on value', () => {
    render(<RadioGroup {...defaultProps} />);

    const option1 = screen.getByRole('radio', { name: /option 1/i });
    const option2 = screen.getByRole('radio', { name: /option 2/i });
    const option3 = screen.getByRole('radio', { name: /option 3/i });

    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
    expect(option3).not.toBeChecked();
  });

  it('generates unique name for radio group', () => {
    render(<RadioGroup {...defaultProps} />);
    const radios = screen.getAllByRole('radio');

    // All radios should have the same name
    const names = radios.map(radio => radio.getAttribute('name'));
    const uniqueNames = [...new Set(names)];
    expect(uniqueNames).toHaveLength(1);
    expect(uniqueNames[0]).toMatch(/^radio-group-/);
  });

  describe('accessibility', () => {
    it('has correct aria attributes', () => {
      render(<RadioGroup {...defaultProps} required error="Error" />);
      const group = screen.getByRole('radiogroup');

      expect(group).toHaveAttribute('aria-required', 'true');
      expect(group).toHaveAttribute('aria-describedby');
    });

    it('links label to group with aria-labelledby', () => {
      render(<RadioGroup {...defaultProps} />);
      const group = screen.getByRole('radiogroup');
      const label = screen.getByText('Test group');

      expect(label).toHaveAttribute('id');
      expect(group).toHaveAttribute('aria-labelledby', label.getAttribute('id'));
    });

    it('links error to group with aria-describedby', () => {
      render(<RadioGroup {...defaultProps} error="Error message" />);
      const group = screen.getByRole('radiogroup');
      const error = screen.getByText('Error message');

      expect(error).toHaveAttribute('id');
      expect(group).toHaveAttribute('aria-describedby', error.getAttribute('id'));
    });
  });

  describe('RadioGroupItem', () => {
    it('renders with correct props', () => {
      const { container } = render(
        <RadioGroup {...defaultProps}>
          <RadioGroupItem value="test" label="Test Item" hint="Test hint" />
        </RadioGroup>
      );

      const radio = screen.getByRole('radio', { name: /test item/i });
      const hint = screen.getByText('Test hint');

      expect(radio).toBeInTheDocument();
      expect(hint).toBeInTheDocument();
    });

    it('throws error when used outside RadioGroup', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<RadioGroupItem value="test" label="Test" />);
      }).toThrow('Radio must be used within a RadioGroup');

      consoleSpy.mockRestore();
    });

    it('is memoized', () => {
      expect(RadioGroupItem).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('has displayName', () => {
      expect(RadioGroupItem.displayName).toBe('RadioGroupItem');
    });
  });

  describe('React.memo optimization', () => {
    it('is memoized', () => {
      expect(RadioGroup).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('has displayName', () => {
      expect(RadioGroup.displayName).toBe('RadioGroup');
    });
  });

  describe('containerClassName', () => {
    it('applies custom container class', () => {
      render(<RadioGroup {...defaultProps} containerClassName="custom-container" />);
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveClass('custom-container');
    });
  });
});
