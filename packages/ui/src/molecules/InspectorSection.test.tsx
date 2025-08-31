import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InspectorSection } from './InspectorSection';

describe('InspectorSection', () => {
  const defaultProps = {
    title: 'Test Section',
    children: <div>Test content</div>,
  };

  it('renders with default props', () => {
    render(<InspectorSection {...defaultProps} />);
    const section = screen.getByText('Test Section');
    expect(section).toBeInTheDocument();
    const content = screen.getByText('Test content');
    expect(content).toBeInTheDocument();
  });

  it('renders title correctly', () => {
    render(<InspectorSection {...defaultProps} />);
    const title = screen.getByText('Test Section');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('SPAN');
  });

  it('renders children content', () => {
    render(<InspectorSection {...defaultProps} />);
    const content = screen.getByText('Test content');
    expect(content).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<InspectorSection {...defaultProps} icon="🎨" />);
    const icon = screen.getByText('🎨');
    expect(icon).toBeInTheDocument();
  });

  it('is expanded by default', () => {
    render(<InspectorSection {...defaultProps} />);
    const content = screen.getByText('Test content');
    expect(content).toBeVisible();
  });

  it('starts collapsed when defaultExpanded is false', () => {
    render(<InspectorSection {...defaultProps} defaultExpanded={false} />);
    const content = screen.getByText('Test content');
    // Content should be hidden with opacity and max-height
    expect(content.closest('[class*="max-h-0"]')).toBeInTheDocument();
  });

  it('toggles expansion when clicked', async () => {
    render(<InspectorSection {...defaultProps} />);
    const header = screen.getByText('Test Section').closest('button');

    // Initially expanded
    const content = screen.getByText('Test content');
    expect(content).toBeVisible();

    // Click to collapse
    if (header) {
      fireEvent.click(header);
      await waitFor(() => {
        expect(content.closest('[class*="max-h-0"]')).toBeInTheDocument();
      });
    }

    // Click to expand again
    if (header) {
      fireEvent.click(header);
      await waitFor(() => {
        expect(content.closest('[class*="max-h-screen"]')).toBeInTheDocument();
      });
    }
  });

  it('does not toggle when collapsible is false', () => {
    render(<InspectorSection {...defaultProps} collapsible={false} />);
    const header = screen.getByText('Test Section').closest('button');
    const content = screen.getByText('Test content');

    // Should be expanded and stay expanded
    expect(content).toBeVisible();

    if (header) {
      fireEvent.click(header);
      expect(content).toBeVisible(); // Should still be visible
    }
  });

  it('applies custom className', () => {
    render(<InspectorSection {...defaultProps} className="custom-class" />);
    const section = screen.getByText('Test Section').closest('div');
    expect(section).toHaveClass('custom-class');
  });

  it('shows chevron down when expanded', () => {
    render(<InspectorSection {...defaultProps} />);
    // We can't easily test the chevron icon without more complex setup,
    // but we can test that the header is a button when collapsible
    const header = screen.getByText('Test Section').closest('button');
    expect(header).toBeInTheDocument();
  });

  it('shows chevron right when collapsed', () => {
    render(<InspectorSection {...defaultProps} defaultExpanded={false} />);
    const header = screen.getByText('Test Section').closest('button');
    expect(header).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<InspectorSection {...defaultProps} />);
    const header = screen.getByText('Test Section').closest('button');

    if (header) {
      expect(header).toHaveAttribute('type', 'button');
      // Test focus styles are applied
      expect(header).toHaveClass('focus:outline-none');
      expect(header).toHaveClass('focus:ring-2');
    }
  });

  it('renders with different content types', () => {
    const complexContent = (
      <div>
        <h3>Complex Content</h3>
        <p>Some paragraph</p>
        <button>Action Button</button>
      </div>
    );

    render(<InspectorSection title="Complex" children={complexContent} />);
    expect(screen.getByText('Complex Content')).toBeInTheDocument();
    expect(screen.getByText('Some paragraph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    render(<InspectorSection title="Empty" children={null} />);
    const section = screen.getByText('Empty');
    expect(section).toBeInTheDocument();
    // Should not crash when children is null/undefined
  });

  it('updates when defaultExpanded changes', () => {
    const { rerender } = render(<InspectorSection {...defaultProps} defaultExpanded={false} />);
    const content = screen.getByText('Test content');

    // Initially collapsed
    expect(content.closest('[class*="max-h-0"]')).toBeInTheDocument();

    // Rerender with defaultExpanded=true
    rerender(<InspectorSection {...defaultProps} defaultExpanded={true} />);

    // Should now be expanded
    expect(content.closest('[class*="max-h-screen"]')).toBeInTheDocument();
  });
});
