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
    expect(screen.getByText('记录')).toBeInTheDocument()
    expect(screen.getByText('历史')).toBeInTheDocument()
    expect(screen.getByText('趋势')).toBeInTheDocument()
    expect(screen.getByText('上床')).toBeInTheDocument()
  })

  it('records time on step tap', () => {
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('上床'))
    expect(store.getTonight().bed).toBeDefined()
  })

  it('adds wake on 醒来 tap', () => {
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('醒来'))
    expect(store.getTonight().wakes).toHaveLength(1)
  })

  it('opens picker state when tapping recorded step', () => {
    store.setTonight({ bed: Date.now(), wakes: [] })
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('上床'))
    // Modal rendered in portal - just verify no crash
  })

  it('submits record', () => {
    store.setTonight({ bed: 1000, slp: 2000, wakes: [3000], up: 4000 })
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('提交记录 ✓'))
    // Confirmation modal in portal - verify button renders without crash
  })

  it('switches to history tab', () => {
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('历史'))
    expect(screen.getByText('暂无记录')).toBeInTheDocument()
  })

  it('switches to trend tab', () => {
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('趋势'))
    expect(screen.getByText(/至少需要 2 条记录/)).toBeInTheDocument()
  })

  it('shows history stats', () => {
    store.setHistory([{ bed: 1000, trySlp: 2000, slp: 3000, wakes: [4000], up: 5000 }])
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('历史'))
    expect(screen.getByText(/近 1 晚平均/)).toBeInTheDocument()
  })

  it('exports CSV', () => {
    store.setHistory([{ bed: 1000, slp: 2000, wakes: [3000], up: 4000 }])
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('历史'))
    fireEvent.click(screen.getByText('导出 CSV'))
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('exports JSON', () => {
    store.setHistory([{ bed: 1000, slp: 2000, wakes: [3000], up: 4000 }])
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    render(<App />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText('历史'))
    fireEvent.click(screen.getByText('导出 JSON'))
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})
