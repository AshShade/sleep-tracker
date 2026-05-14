import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    coverage: {
      include: ['src/**'],
      exclude: ['src/vite-env.d.ts', 'src/test-setup.ts', 'src/main.tsx'],
      thresholds: { lines: 100, functions: 100, statements: 100 },
      ignoreEmptyLines: true,
    },
  },
})
