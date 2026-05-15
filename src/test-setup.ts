import '@testing-library/jest-dom'

// Mantine requires matchMedia in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('prefers-color-scheme: dark'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// ResizeObserver mock for Mantine
;(globalThis as any).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
