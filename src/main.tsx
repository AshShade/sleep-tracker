import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import './i18n'
import App from './App'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'

// Seed mock data in dev mode if no history exists
if (import.meta.env.DEV && !localStorage.getItem('sleep_history')) {
  import('./mock-data').then(m => {
    localStorage.setItem('sleep_history', JSON.stringify(m.default))
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <Notifications position="bottom-center" containerWidth={300} style={{ marginBottom: '60px' }} />
      <App />
    </MantineProvider>
  </StrictMode>
)

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js')
