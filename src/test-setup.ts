import '@testing-library/jest-dom'

// Suppress rc-util's unmountComponentAtNode error (removed in React 19, antd-mobile compat issue)
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('unmountComponentAtNode')) return
  originalConsoleError(...args)
}

// Suppress unhandled rejection from rc-util legacy unmount
process.on('unhandledRejection', (reason: unknown) => {
  if (reason instanceof TypeError && reason.message.includes('unmountComponentAtNode')) return
  throw reason
})
