import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { getHistory, SleepRecord } from './store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function toHours(ms: number) { return +(ms / 3600000).toFixed(2) }

export default function TrendTab() {
  const hist = getHistory().slice(0, 30).reverse()
  if (hist.length < 2) return <p className="empty-msg">至少需要 2 条记录才能显示趋势</p>

  const labels = hist.map(r => {
    const d = new Date(r.bed || r.slp || r.wakes[0] || r.up || 0)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })

  const getData = (fn: (r: SleepRecord) => number | null) => hist.map(fn)

  const data = {
    labels,
    datasets: [
      { label: '睡眠时长', data: getData(r => r.slp && r.wakes[0] ? toHours(r.wakes[0] - r.slp) : null), borderColor: '#4ade80', backgroundColor: '#4ade8033', tension: 0.3, spanGaps: true, pointRadius: 3 },
      { label: '入睡耗时', data: getData(r => r.trySlp && r.slp ? toHours(r.slp - r.trySlp) : null), borderColor: '#f59e0b', backgroundColor: '#f59e0b33', tension: 0.3, spanGaps: true, pointRadius: 3 },
      { label: '赖床时间', data: getData(r => r.wakes.length && r.up ? toHours(r.up - r.wakes[r.wakes.length - 1]) : null), borderColor: '#f87171', backgroundColor: '#f8717133', tension: 0.3, spanGaps: true, pointRadius: 3 },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#909296', boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}h` } },
    },
    scales: {
      x: { ticks: { color: '#5c5f66', font: { size: 10 } }, grid: { color: '#2c2e33' } },
      y: { ticks: { color: '#5c5f66', callback: (v: any) => `${v}h` }, grid: { color: '#2c2e33' }, min: 0 },
    },
  }

  return (
    <div className="trend-card">
      <h3 className="trend-title">近 {hist.length} 晚趋势（小时）</h3>
      <Line data={data} options={options} />
    </div>
  )
}
