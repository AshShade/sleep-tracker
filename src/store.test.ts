import { describe, it, expect, beforeEach } from 'vitest'
import { getTonight, setTonight, getHistory, setHistory, archiveAndReset, dur, fmtTime, STEPS } from './store'

beforeEach(() => localStorage.clear())

describe('store', () => {
  describe('getTonight / setTonight', () => {
    it('returns empty record with wakes array when nothing stored', () => {
      expect(getTonight()).toEqual({ wakes: [] })
    })
    it('round-trips a record', () => {
      const r = { bed: 1000, slp: 2000, wakes: [3000, 4000], up: 5000 }
      setTonight(r)
      expect(getTonight()).toEqual(r)
    })
  })

  describe('migration', () => {
    it('migrates old wake:number to wakes:[]', () => {
      localStorage.setItem('sleep_tonight', JSON.stringify({ bed: 1, wake: 2 }))
      expect(getTonight()).toEqual({ bed: 1, wakes: [2] })
    })
    it('adds wakes array if missing', () => {
      localStorage.setItem('sleep_tonight', JSON.stringify({ bed: 1 }))
      expect(getTonight()).toEqual({ bed: 1, wakes: [] })
    })
    it('migrates history records', () => {
      localStorage.setItem('sleep_history', JSON.stringify([{ bed: 1, wake: 2 }]))
      expect(getHistory()[0]).toEqual({ bed: 1, wakes: [2] })
    })
  })

  describe('getHistory / setHistory', () => {
    it('returns empty array when nothing stored', () => {
      expect(getHistory()).toEqual([])
    })
    it('setHistory persists and limits to 90', () => {
      const hist = Array.from({ length: 95 }, (_, i) => ({ wakes: [i] })) as any
      setHistory(hist)
      expect(getHistory()).toHaveLength(90)
    })
  })

  describe('archiveAndReset', () => {
    it('prepends record to history and clears tonight', () => {
      archiveAndReset({ bed: 100, wakes: [200], up: 300 })
      expect(getTonight()).toEqual({ wakes: [] })
      expect(getHistory()[0]).toEqual({ bed: 100, wakes: [200], up: 300 })
    })
  })

  describe('dur', () => {
    it('formats minutes < 60', () => {
      expect(dur(30 * 60000)).toBe('30分钟')
    })
    it('formats hours + minutes', () => {
      expect(dur(90 * 60000)).toBe('1时30分')
    })
  })

  describe('fmtTime', () => {
    it('formats a timestamp as HH:MM', () => {
      const d = new Date(2026, 0, 1, 23, 45)
      expect(fmtTime(d.getTime())).toMatch(/23:45/)
    })
  })

  describe('STEPS', () => {
    it('has 4 entries (no wake — handled separately)', () => {
      expect(STEPS).toHaveLength(4)
      expect(STEPS.map(s => s.key)).toEqual(['bed', 'trySlp', 'slp', 'up'])
    })
  })
})
