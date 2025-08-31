import React, { useMemo } from 'react';
import type { UseButtonBlockStylesResult, ButtonBlockMetadata } from '../types';

/**
 * Хук для работы со стилями ButtonBlock
 * Преобразует metadata в CSS стили и классы
 */
export const useButtonBlockStyles = (
  metadata?: ButtonBlockMetadata,
  className?: string
): UseButtonBlockStylesResult => {
  // Генерация стилей из metadata
  const buttonStyles: React.CSSProperties = useMemo(() => {
    const styles: React.CSSProperties = {};

    if (!metadata) {
      return styles;
    }

    // Spacing (margins)
    if (metadata.spacing) {
      const { marginTop, marginRight, marginBottom, marginLeft } = metadata.spacing;
      if (marginTop) styles.marginTop = marginTop;
      if (marginRight) styles.marginRight = marginRight;
      if (marginBottom) styles.marginBottom = marginBottom;
      if (marginLeft) styles.marginLeft = marginLeft;
    }

    // Border
    if (metadata.border) {
      const { width, style, color, radius } = metadata.border;
      if (width && style && style !== 'none') {
        styles.borderWidth = width;
        styles.borderStyle = style;
        if (color) styles.borderColor = color;
      }
      if (radius) styles.borderRadius = radius;
    }

    // Text color
    if (metadata.textColor) {
      styles.color = metadata.textColor;
    }

    // Background color
    if (metadata.backgroundColor) {
      styles.backgroundColor = metadata.backgroundColor;
    }

    return styles;
  }, [metadata]);

  // Формирование итогового className
  const containerClassName = useMemo(() => {
    const classes = ['flex justify-start'];

    if (className) {
      classes.push(className);
    }

    if (metadata?.customClassName) {
      classes.push(metadata.customClassName);
    }

    return classes.join(' ');
  }, [className, metadata?.customClassName]);

  return {
    buttonStyles,
    containerClassName
  };
};
