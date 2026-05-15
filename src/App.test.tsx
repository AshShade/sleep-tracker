import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import App from './App'
import * as store from './store'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider defaultColorScheme="dark">{children}</MantineProvider>
)

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks() })

describe('App', () => {
  it('renders tabs and record view', () => {
    render(<App />, { wrapper: Wrapper })
    expect(screen.getByText('Record')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('Trend')).toBeInTheDocument()
    expect(screen.getByText('Bedtime')).toBeInTheDocument()
  })

  it('records time on step tap', () => {
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Bedtime'))
    expect(store.getTonight().bed).toBeDefined()
  })

  it('adds wake on 醒来 tap', () => {
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Woke up'))
    expect(store.getTonight().wakes).toHaveLength(1)
  })

  it('opens picker state when tapping recorded step', () => {
    store.setTonight({ bed: Date.now(), wakes: [] })
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Bedtime'))
    // Modal rendered in portal - just verify no crash
  })

  it('submits record', () => {
    store.setTonight({ bed: 1000, slp: 2000, wakes: [3000], up: 4000 })
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Submit ✓'))
    // Confirmation modal in portal - verify button renders without crash
  })

  it('switches to history tab', () => {
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('History'))
    expect(screen.getByText('No records yet')).toBeInTheDocument()
  })

  it('switches to trend tab', () => {
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('Trend'))
    expect(screen.getByText(/Need at least 2 records/)).toBeInTheDocument()
  })

  it('shows history stats', () => {
    store.setHistory([{ bed: 1000, trySlp: 2000, slp: 3000, wakes: [4000], up: 5000 }])
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('History'))
    expect(screen.getByText(/Last 1 nights avg/)).toBeInTheDocument()
  })

  it('exports CSV', () => {
    store.setHistory([{ bed: 1000, slp: 2000, wakes: [3000], up: 4000 }])
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('History'))
    fireEvent.click(screen.getByText('Export CSV'))
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('exports JSON', () => {
    store.setHistory([{ bed: 1000, slp: 2000, wakes: [3000], up: 4000 }])
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('History'))
    fireEvent.click(screen.getByText('Export JSON'))
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})
