import { SleepEntry } from './store'

const mockHistory: SleepEntry[] = [
  ...Array.from({ length: 10 }, (_, i) => {
    const base = Date.now() - (i + 1) * 86400000
    const bed = base - (Math.random() * 2 + 6) * 3600000
    const trySlp = bed + (10 + Math.random() * 20) * 60000
    const slp = trySlp + (5 + Math.random() * 40) * 60000
    const wake1 = slp + (3 + Math.random() * 2) * 3600000
    const wake2 = wake1 + (1 + Math.random()) * 3600000
    const up = wake2 + (5 + Math.random() * 30) * 60000
    return { type: 'night' as const, bed, trySlp, slp, wakes: [wake1, wake2], up }
  }),
  ...Array.from({ length: 4 }, (_, i) => {
    const base = Date.now() - (i * 3 + 1) * 86400000 + 14 * 3600000
    const start = base
    const end = start + (20 + Math.random() * 40) * 60000
    return { type: 'nap' as const, start, end }
  }),
].sort((a, b) => {
  const ta = a.type === 'night' ? (a.up || 0) : (a.end || 0)
  const tb = b.type === 'night' ? (b.up || 0) : (b.end || 0)
  return tb - ta
})

export default mockHistory
