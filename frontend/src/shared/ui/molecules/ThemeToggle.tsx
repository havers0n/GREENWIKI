import React from 'react';
import { ActionIcon, Group, Tooltip, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';

const ThemeToggle: React.FC = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });

  const isDark = computed === 'dark';

  const toggle = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Group gap="xs">
      <Tooltip label={isDark ? 'Светлая тема' : 'Тёмная тема'} withArrow>
        <ActionIcon
          variant="subtle"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggle}
          size="lg"
        >
          {isDark ? (
            // Sun icon
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ) : (
            // Moon icon
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Авто (системная)" withArrow>
        <ActionIcon
          variant="subtle"
          aria-label="Use system color scheme"
          onClick={() => setColorScheme('auto')}
          size="lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18"></path>
            <path d="M16 7h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M8 7h-1a4 4 0 0 0 0 8h1"></path>
          </svg>
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export { ThemeToggle };
export default ThemeToggle;
