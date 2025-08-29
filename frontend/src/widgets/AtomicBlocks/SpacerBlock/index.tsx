import React from 'react';

interface SpacerBlockProps {
  height: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customHeight?: number;
}

const SpacerBlock: React.FC<SpacerBlockProps> = ({ height, customHeight }) => {
  const getHeightClass = () => {
    switch (height) {
      case 'sm': return 'h-4'; // 1rem
      case 'md': return 'h-8'; // 2rem
      case 'lg': return 'h-16'; // 4rem
      case 'xl': return 'h-24'; // 6rem
      case 'custom': return '';
      default: return 'h-8';
    }
  };

  const style = height === 'custom' && customHeight 
    ? { height: `${customHeight}px` }
    : undefined;

  return (
    <div 
      className={`w-full ${getHeightClass()} bg-transparent`}
      style={style}
      aria-label={`Отступ ${height === 'custom' ? `${customHeight}px` : height}`}
    />
  );
};

export default SpacerBlock;
