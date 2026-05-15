import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { allowedHosts: ['devdesk'] },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    coverage: {
      include: ['src/**'],
      exclude: ['src/vite-env.d.ts', 'src/test-setup.ts', 'src/main.tsx', 'src/mock-data.ts'],
      thresholds: {
        'src/store.ts': { statements: 100, functions: 100, lines: 100 },
      },
    },
  },
})
