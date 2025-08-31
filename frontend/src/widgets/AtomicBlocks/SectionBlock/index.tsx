import React from 'react';

interface SectionBlockProps {
  backgroundColor?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  maxWidth?: string;
  children?: React.ReactNode;
  metadata?: Record<string, unknown>;
}

const SectionBlock: React.FC<SectionBlockProps> = ({
  backgroundColor,
  padding = 'medium',
  maxWidth = '1200px',
  children,
  metadata = {}
}) => {
  const paddingClass = {
    none: 'p-0',
    small: 'p-4',
    medium: 'p-8',
    large: 'p-12'
  }[padding];

  const sectionStyle: React.CSSProperties = {
    backgroundColor: backgroundColor || 'transparent',
    maxWidth: maxWidth || 'none',
    margin: '0 auto',
    width: '100%',
    ...metadata
  };

  return (
    <section
      className={`${paddingClass} min-h-0`}
      style={sectionStyle}
    >
      {children}
    </section>
  );
};

export default SectionBlock;
