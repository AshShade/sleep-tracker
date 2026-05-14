import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import * as store from './store'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('App', () => {
  it('renders bottom tab bar and record view', () => {
    render(<App />)
    expect(screen.getByText('记录')).toBeInTheDocument()
    expect(screen.getByText('历史')).toBeInTheDocument()
    expect(screen.getByText('趋势')).toBeInTheDocument()
    expect(screen.getByText('上床')).toBeInTheDocument()
  })

  it('records time on step tap with toast', () => {
    render(<App />)
    fireEvent.click(screen.getByText('上床'))
    expect(store.getTonight().bed).toBeDefined()
  })

  it('archives on submit with Modal confirm', () => {
    store.setTonight({ bed: 1000, slp: 2000, wake: 3000 })
    render(<App />)
    fireEvent.click(screen.getByText('起床'))
    fireEvent.click(screen.getByText('提交记录 ✓'))
    expect(screen.getByText('确认提交本次睡眠记录？')).toBeInTheDocument()
    fireEvent.click(screen.getByText('确认'))
    expect(store.getTonight()).toEqual({})
    expect(store.getHistory()).toHaveLength(1)
  })

  it('cancels submit Modal', () => {
    store.setTonight({ bed: 1000 })
    render(<App />)
    fireEvent.click(screen.getByText('提交记录 ✓'))
    fireEvent.click(screen.getByText('取消'))
    expect(store.getTonight().bed).toBe(1000)
  })

  it('opens DatePicker when tapping recorded step', () => {
    store.setTonight({ bed: new Date(2026, 0, 1, 22, 30).getTime() })
    render(<App />)
    fireEvent.click(screen.getByText('上床'))
    expect(screen.getByText('确定')).toBeInTheDocument()
  })

  it('switches to history tab with empty state', () => {
    render(<App />)
    fireEvent.click(screen.getAllByText('历史')[0])
    expect(screen.getByText('暂无记录')).toBeInTheDocument()
  })

  it('switches to trend tab', () => {
    render(<App />)
    fireEvent.click(screen.getAllByText('趋势')[0])
    expect(screen.getByText(/至少需要 2 条记录/)).toBeInTheDocument()
  })

  it('switches back to record tab', () => {
    render(<App />)
    fireEvent.click(screen.getAllByText('历史')[0])
    fireEvent.click(screen.getAllByText('记录')[0])
    expect(screen.getByText('上床')).toBeInTheDocument()
  })

  it('shows history stats and list', () => {
    localStorage.setItem('sleep_history', JSON.stringify([{ bed: 1000, trySlp: 2000, slp: 3000, wake: 4000, up: 5000 }]))
    render(<App />)
    fireEvent.click(screen.getAllByText('历史')[0])
    expect(screen.getByText(/近 1 晚平均/)).toBeInTheDocument()
  })

  it('exports CSV', () => {
    localStorage.setItem('sleep_history', JSON.stringify([{ bed: 1000, slp: 2000, wake: 3000, up: 4000 }]))
    const clickMock = vi.fn()
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return { click: clickMock, set href(_: string) {}, set download(_: string) {} } as unknown as HTMLAnchorElement
      return document.createElementNS('http://www.w3.org/1999/xhtml', tag) as HTMLElement
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    render(<App />)
    fireEvent.click(screen.getAllByText('历史')[0])
    fireEvent.click(screen.getByText('导出 CSV'))
    expect(clickMock).toHaveBeenCalled()
  })

  it('exports JSON', () => {
    localStorage.setItem('sleep_history', JSON.stringify([{ bed: 1000, slp: 2000, wake: 3000, up: 4000 }]))
    const clickMock = vi.fn()
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return { click: clickMock, set href(_: string) {}, set download(_: string) {} } as unknown as HTMLAnchorElement
      return document.createElementNS('http://www.w3.org/1999/xhtml', tag) as HTMLElement
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    render(<App />)
    fireEvent.click(screen.getAllByText('历史')[0])
    fireEvent.click(screen.getByText('导出 JSON'))
    expect(clickMock).toHaveBeenCalled()
  })
})
