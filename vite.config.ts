import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
  plugins: [react()],
  base: './',
  server: env.VITE_ALLOWED_HOST
    ? { allowedHosts: [env.VITE_ALLOWED_HOST] }
    : undefined,
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
}})
