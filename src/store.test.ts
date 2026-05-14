import { describe, it, expect, beforeEach } from 'vitest'
import { getTonight, setTonight, getHistory, archiveAndReset, dur, fmtTime, STEPS } from './store'

beforeEach(() => localStorage.clear())

describe('store', () => {
  describe('getTonight / setTonight', () => {
    it('returns empty object when nothing stored', () => {
      expect(getTonight()).toEqual({})
    })
    it('round-trips a record', () => {
      const r = { bed: 1000, slp: 2000 }
      setTonight(r)
      expect(getTonight()).toEqual(r)
    })
  })

  describe('getHistory', () => {
    it('returns empty array when nothing stored', () => {
      expect(getHistory()).toEqual([])
    })
    it('returns stored history', () => {
      localStorage.setItem('sleep_history', JSON.stringify([{ bed: 1 }]))
      expect(getHistory()).toEqual([{ bed: 1 }])
    })
  })

  describe('archiveAndReset', () => {
    it('prepends record to history and clears tonight', () => {
      setTonight({ bed: 100 })
      archiveAndReset({ bed: 100, up: 200 })
      expect(getTonight()).toEqual({})
      expect(getHistory()[0]).toEqual({ bed: 100, up: 200 })
    })
    it('limits history to 90 entries', () => {
      const existing = Array.from({ length: 90 }, (_, i) => ({ bed: i }))
      localStorage.setItem('sleep_history', JSON.stringify(existing))
      archiveAndReset({ bed: 999 })
      const hist = getHistory()
      expect(hist).toHaveLength(90)
      expect(hist[0].bed).toBe(999)
      expect(hist[89].bed).toBe(88)
    })
  })

  describe('dur', () => {
    it('formats minutes < 60', () => {
      expect(dur(30 * 60000)).toBe('30分钟')
    })
    it('formats hours + minutes', () => {
      expect(dur(90 * 60000)).toBe('1时30分')
    })
    it('rounds to nearest minute', () => {
      expect(dur(29.6 * 60000)).toBe('30分钟')
    })
  })

  describe('fmtTime', () => {
    it('formats a timestamp as HH:MM', () => {
      const d = new Date(2026, 0, 1, 23, 45)
      expect(fmtTime(d.getTime())).toMatch(/23:45/)
    })
  })

  describe('STEPS', () => {
    it('has 5 entries with correct keys', () => {
      expect(STEPS).toHaveLength(5)
      expect(STEPS.map(s => s.key)).toEqual(['bed', 'trySlp', 'slp', 'wake', 'up'])
    })
  })
})
