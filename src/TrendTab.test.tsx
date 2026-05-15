import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import TrendTab from './TrendTab'

const W = ({ children }: { children: React.ReactNode }) => <MantineProvider>{children}</MantineProvider>

beforeEach(() => localStorage.clear())

describe('TrendTab', () => {
  it('shows message when less than 2 records', () => {
    render(<TrendTab />, { wrapper: W })
    expect(screen.getByText(/Need at least 2 records/)).toBeInTheDocument()
  })

  it('renders charts with sufficient data', () => {
    const records = [
      { type: 'night', bed: 1000, trySlp: 2000, slp: 3000, wakes: [30000000], up: 40000000 },
      { type: 'night', bed: 2000, trySlp: 3000, slp: 4000, wakes: [40000000], up: 50000000 },
    ]
    localStorage.setItem('sleep_history', JSON.stringify(records))
    render(<TrendTab />, { wrapper: W })
    expect(screen.getByText('Sleep duration')).toBeInTheDocument()
    expect(screen.getByText('Onset latency')).toBeInTheDocument()
    expect(screen.getByText('Snooze time')).toBeInTheDocument()
    expect(screen.getByText('Total in-bed')).toBeInTheDocument()
  })
})
