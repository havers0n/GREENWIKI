import '@testing-library/jest-dom';

// Мокаем matchMedia для тестов
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Мокаем ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb: any) {
    this.cb = cb;
  }
  cb: any;
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Мокаем IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};
