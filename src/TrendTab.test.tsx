import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import TrendTab from './TrendTab'

const W = ({ children }: { children: React.ReactNode }) => <MantineProvider>{children}</MantineProvider>

beforeEach(() => localStorage.clear())

describe('TrendTab', () => {
  it('shows message when less than 2 records', () => {
    render(<TrendTab />, { wrapper: W })
    expect(screen.getByText(/至少需要 2 条记录/)).toBeInTheDocument()
  })

  it('renders charts with sufficient data', () => {
    const records = [
      { type: 'night', bed: 1000, trySlp: 2000, slp: 3000, wakes: [30000000], up: 40000000 },
      { type: 'night', bed: 2000, trySlp: 3000, slp: 4000, wakes: [40000000], up: 50000000 },
    ]
    localStorage.setItem('sleep_history', JSON.stringify(records))
    render(<TrendTab />, { wrapper: W })
    expect(screen.getByText('睡眠时长')).toBeInTheDocument()
    expect(screen.getByText('入睡耗时')).toBeInTheDocument()
    expect(screen.getByText('赖床时间')).toBeInTheDocument()
    expect(screen.getByText('在床总时长')).toBeInTheDocument()
  })
})
