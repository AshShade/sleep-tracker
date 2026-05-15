export type NightRecord = {
  type: 'night'
  bed?: number
  trySlp?: number
  slp?: number
  wakes: number[]
  up?: number
}

export type NapRecord = {
  type: 'nap'
  start?: number
  end?: number
}

export type SleepEntry = NightRecord | NapRecord

export const NIGHT_STEPS: { key: keyof Omit<NightRecord, 'wakes' | 'type'>; label: string }[] = [
  { key: 'bed', label: '上床' },
  { key: 'trySlp', label: '尝试入睡' },
  { key: 'slp', label: '入睡' },
  { key: 'up', label: '起床' },
]

export const NAP_STEPS: { key: keyof Omit<NapRecord, 'type'>; label: string }[] = [
  { key: 'start', label: '入睡' },
  { key: 'end', label: '醒来' },
]

const TONIGHT_KEY = 'sleep_tonight'
const NAP_KEY = 'sleep_nap'
const HISTORY_KEY = 'sleep_history'

// TODO: Remove migration after 2026-08
function migrateNight(r: Record<string, unknown>): NightRecord {
  if ('wake' in r && typeof r.wake === 'number') {
    const { wake, type: _, ...rest } = r
    return { type: 'night', ...rest, wakes: [wake] } as NightRecord
  }
  if (!('wakes' in r)) return { type: 'night', ...r, wakes: [] } as NightRecord
  return { type: 'night', ...r, wakes: (r.wakes as number[]) } as NightRecord
}

function migrateEntry(r: Record<string, unknown>): SleepEntry {
  if (r.type === 'nap') return r as unknown as NapRecord
  return migrateNight(r)
}

export function getTonight(): NightRecord {
  const raw = JSON.parse(localStorage.getItem(TONIGHT_KEY) || '{"type":"night","wakes":[]}')
  return migrateNight(raw)
}

export function setTonight(r: NightRecord) {
  localStorage.setItem(TONIGHT_KEY, JSON.stringify(r))
}

export function getCurrentNap(): NapRecord {
  return JSON.parse(localStorage.getItem(NAP_KEY) || '{"type":"nap"}')
}

export function setCurrentNap(r: NapRecord) {
  localStorage.setItem(NAP_KEY, JSON.stringify(r))
}

export function getHistory(): SleepEntry[] {
  const stored: Record<string, unknown>[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  if (stored.length) return stored.map(migrateEntry)
  return []
}

export function setHistory(hist: SleepEntry[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 120)))
}

export function archiveNight(record: NightRecord) {
  const hist = getHistory()
  hist.unshift({ ...record })
  setHistory(hist)
  setTonight({ type: 'night', wakes: [] })
}

export function archiveNap(record: NapRecord) {
  const hist = getHistory()
  hist.unshift({ ...record })
  setHistory(hist)
  setCurrentNap({ type: 'nap' })
}

export function dur(ms: number): string {
  const m = Math.round(ms / 60000)
  return m < 60 ? `${m}分钟` : `${Math.floor(m / 60)}时${m % 60}分`
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDateTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
}
