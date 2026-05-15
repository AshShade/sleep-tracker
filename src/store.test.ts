import { describe, it, expect, beforeEach } from 'vitest'
import { getTonight, setTonight, getHistory, setHistory, archiveNight, archiveNap, getCurrentNap, setCurrentNap, dur, fmtTime, fmtDateTime, NIGHT_STEPS, NAP_STEPS, NightRecord, NapRecord } from './store'

beforeEach(() => localStorage.clear())

describe('store', () => {
  describe('night record', () => {
    it('returns empty night when nothing stored', () => {
      expect(getTonight()).toEqual({ type: 'night', wakes: [] })
    })
    it('round-trips a night record', () => {
      const r: NightRecord = { type: 'night', bed: 1000, slp: 2000, wakes: [3000], up: 4000 }
      setTonight(r)
      expect(getTonight()).toEqual(r)
    })
    it('migrates old wake:number to wakes:[]', () => {
      localStorage.setItem('sleep_tonight', JSON.stringify({ bed: 1, wake: 2 }))
      expect(getTonight().wakes).toEqual([2])
    })
  })

  describe('nap record', () => {
    it('returns empty nap when nothing stored', () => {
      expect(getCurrentNap()).toEqual({ type: 'nap' })
    })
    it('round-trips a nap', () => {
      const r: NapRecord = { type: 'nap', start: 100, end: 200 }
      setCurrentNap(r)
      expect(getCurrentNap()).toEqual(r)
    })
  })

  describe('history', () => {
    it('returns empty array', () => { expect(getHistory()).toEqual([]) })
    it('archives night', () => {
      archiveNight({ type: 'night', bed: 1, wakes: [2], up: 3 })
      expect(getTonight()).toEqual({ type: 'night', wakes: [] })
      expect(getHistory()[0]).toEqual({ type: 'night', bed: 1, wakes: [2], up: 3 })
    })
    it('archives nap', () => {
      archiveNap({ type: 'nap', start: 1, end: 2 })
      expect(getCurrentNap()).toEqual({ type: 'nap' })
      expect(getHistory()[0]).toEqual({ type: 'nap', start: 1, end: 2 })
    })
    it('limits to 120', () => {
      const big = Array.from({ length: 125 }, (_, i) => ({ type: 'night' as const, wakes: [i] }))
      setHistory(big as any)
      expect(getHistory()).toHaveLength(120)
    })
    it('migrates old entries', () => {
      localStorage.setItem('sleep_history', JSON.stringify([{ bed: 1, wake: 2 }]))
      expect(getHistory()[0]).toEqual({ type: 'night', bed: 1, wakes: [2] })
    })
  })

  describe('utils', () => {
    it('dur formats minutes', () => { expect(dur(30 * 60000)).toBe('30分钟') })
    it('dur formats hours', () => { expect(dur(90 * 60000)).toBe('1时30分') })
    it('fmtTime', () => { expect(fmtTime(new Date(2026, 0, 1, 23, 45).getTime())).toMatch(/23:45/) })
    it('fmtDateTime', () => { expect(fmtDateTime(new Date(2026, 4, 15, 23, 45).getTime())).toMatch(/5\/15.*23:45/) })
  })

  describe('constants', () => {
    it('NIGHT_STEPS has 4', () => { expect(NIGHT_STEPS).toHaveLength(4) })
    it('NAP_STEPS has 2', () => { expect(NAP_STEPS).toHaveLength(2) })
  })
})
