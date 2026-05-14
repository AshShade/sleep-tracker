export type SleepRecord = {
  bed?: number
  trySlp?: number
  slp?: number
  wake?: number
  up?: number
}

export const STEPS: { key: keyof SleepRecord; label: string }[] = [
  { key: 'bed', label: '上床' },
  { key: 'trySlp', label: '尝试入睡' },
  { key: 'slp', label: '入睡' },
  { key: 'wake', label: '醒来' },
  { key: 'up', label: '起床' },
]

const STORAGE_KEY = 'sleep_tonight'
const HISTORY_KEY = 'sleep_history'

export function getTonight(): SleepRecord {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
}

export function setTonight(r: SleepRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
}

export function getHistory(): SleepRecord[] {
  const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  if (stored.length) return stored
  /* v8 ignore next */
  if (import.meta.env.DEV && !import.meta.env.VITEST) return mockHistory
  return []
}

/* v8 ignore start */
let mockHistory: SleepRecord[] = []
if (import.meta.env.DEV && !import.meta.env.VITEST) {
  mockHistory = Array.from({ length: 14 }, (_, i) => {
    const base = Date.now() - (i + 1) * 86400000
    const bed = base - (Math.random() * 2 + 6) * 3600000
    const trySlp = bed + (10 + Math.random() * 20) * 60000
    const slp = trySlp + (5 + Math.random() * 40) * 60000
    const wake = slp + (5.5 + Math.random() * 2.5) * 3600000
    const up = wake + (5 + Math.random() * 30) * 60000
    return { bed, trySlp, slp, wake, up }
  })
}
/* v8 ignore stop */

export function archiveAndReset(record: SleepRecord) {
  const hist = getHistory()
  hist.unshift({ ...record })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 90)))
  setTonight({})
}

export function dur(ms: number): string {
  const m = Math.round(ms / 60000)
  return m < 60 ? `${m}分钟` : `${Math.floor(m / 60)}时${m % 60}分`
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
