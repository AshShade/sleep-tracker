import { SleepRecord } from './store'

const mockHistory: SleepRecord[] = Array.from({ length: 14 }, (_, i) => {
  const base = Date.now() - (i + 1) * 86400000
  const bed = base - (Math.random() * 2 + 6) * 3600000
  const trySlp = bed + (10 + Math.random() * 20) * 60000
  const slp = trySlp + (5 + Math.random() * 40) * 60000
  const wake1 = slp + (3 + Math.random() * 2) * 3600000
  const wake2 = wake1 + (1 + Math.random()) * 3600000
  const up = wake2 + (5 + Math.random() * 30) * 60000
  return { bed, trySlp, slp, wakes: [wake1, wake2], up }
})

export default mockHistory
