import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { getHistory, SleepRecord } from './store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function toHours(ms: number) { return +(ms / 3600000).toFixed(2) }

export default function TrendTab() {
  const hist = getHistory().slice(0, 30).reverse()
  if (hist.length < 2) return <p className="empty-msg">至少需要 2 条记录才能显示趋势</p>

  const labels = hist.map(r => {
    const d = new Date(r.bed || r.slp || r.wake || r.up || 0)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })

  const dataset = (label: string, k1: keyof SleepRecord, k2: keyof SleepRecord, color: string) => ({
    label,
    data: hist.map(r => r[k1] && r[k2] ? toHours(r[k2]! - r[k1]!) : null),
    borderColor: color,
    backgroundColor: color + '33',
    tension: 0.3,
    spanGaps: true,
    pointRadius: 3,
  })

  const data = {
    labels,
    datasets: [
      dataset('睡眠时长', 'slp', 'wake', '#4ade80'),
      dataset('入睡耗时', 'trySlp', 'slp', '#f59e0b'),
      dataset('赖床时间', 'wake', 'up', '#f87171'),
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#94a3b8', boxWidth: 12, font: { size: 11 } } },
      /* v8 ignore next */
      tooltip: { callbacks: { label: (ctx: { parsed: { y: number }, dataset: { label?: string } }) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}h` } },
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } },
      /* v8 ignore next */
      y: { ticks: { color: '#64748b', callback: (v: number | string) => `${v}h` }, grid: { color: '#1e293b' }, min: 0 },
    },
  }

  return (
    <div className="trend-card">
      <h3 className="trend-title">近 {hist.length} 晚趋势（小时）</h3>
      <Line data={data} options={options} />
    </div>
  )
}
