import React, { useEffect } from 'react';
import { MantineProvider, createTheme, useComputedColorScheme } from '@mantine/core';
import type { MantineColorsTuple } from '@mantine/core';
import { generateColors } from '@mantine/colors-generator';
import tokens from 'shared/config/theme.json';

const toPalette = (hex: string): MantineColorsTuple => {
  return generateColors(hex);
};

const tailwindGray: MantineColorsTuple = [
  '#f9fafb', // 50
  '#f3f4f6', // 100
  '#e5e7eb', // 200
  '#d1d5db', // 300
  '#9ca3af', // 400
  '#6b7280', // 500
  '#4b5563', // 600
  '#374151', // 700
  '#1f2937', // 800
  '#111827', // 900
];

const theme = createTheme({
  colors: {
    primary: toPalette(tokens.colors.primary),
    dark: toPalette(tokens.colors.dark),
    gray: tailwindGray,
    secondary: toPalette(tokens.colors.secondary),
  },
  primaryColor: 'primary',
});

const TailwindDarkSync: React.FC = () => {
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });

  useEffect(() => {
    const root = document.documentElement;
    if (computed === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [computed]);

  return null;
};

export const AppMantineProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <TailwindDarkSync />
      {children}
    </MantineProvider>
  );
};
