import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TrendTab from './TrendTab'

beforeEach(() => localStorage.clear())

describe('TrendTab', () => {
  it('shows message when less than 2 records', () => {
    render(<TrendTab />)
    expect(screen.getByText(/至少需要 2 条记录/)).toBeInTheDocument()
  })

  it('renders chart with sufficient data', () => {
    const records = [
      { bed: 1000, trySlp: 2000, slp: 3000, wake: 30000000, up: 40000000 },
      { bed: 2000, trySlp: 3000, slp: 4000, wake: 40000000, up: 50000000 },
    ]
    localStorage.setItem('sleep_history', JSON.stringify(records))
    render(<TrendTab />)
    expect(screen.getByText(/近 2 晚趋势/)).toBeInTheDocument()
  })
})
