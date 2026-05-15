export type SleepRecord = {
  bed?: number
  trySlp?: number
  slp?: number
  wakes: number[]
  up?: number
}

export const STEPS: { key: keyof Omit<SleepRecord, 'wakes'>; label: string }[] = [
  { key: 'bed', label: '上床' },
  { key: 'trySlp', label: '尝试入睡' },
  { key: 'slp', label: '入睡' },
  { key: 'up', label: '起床' },
]

const STORAGE_KEY = 'sleep_tonight'
const HISTORY_KEY = 'sleep_history'

// TODO: Remove migration after 2026-08 — all users will have migrated by then
function migrate(r: Record<string, unknown>): SleepRecord {
  if ('wake' in r && typeof r.wake === 'number') {
    const { wake, ...rest } = r
    return { ...rest, wakes: [wake] } as SleepRecord
  }
  if (!('wakes' in r)) return { ...r, wakes: [] } as SleepRecord
  return r as SleepRecord
}

export function getTonight(): SleepRecord {
  return migrate(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"wakes":[]}'))
}

export function setTonight(r: SleepRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
}

export function getHistory(): SleepRecord[] {
  const stored: Record<string, unknown>[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  if (stored.length) return stored.map(migrate)
  return []
}

export function setHistory(hist: SleepRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 90)))
}

export function archiveAndReset(record: SleepRecord) {
  const hist = getHistory()
  hist.unshift({ ...record })
  setHistory(hist)
  setTonight({ wakes: [] })
}

export function dur(ms: number): string {
  const m = Math.round(ms / 60000)
  return m < 60 ? `${m}分钟` : `${Math.floor(m / 60)}时${m % 60}分`
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
