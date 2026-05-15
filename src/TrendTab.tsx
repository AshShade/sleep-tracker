import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { Stack, Text } from '@mantine/core'
import { getHistory, NightRecord } from './store'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

function toHours(ms: number) { return +(ms / 3600000).toFixed(2) }

export default function TrendTab() {
  const hist = getHistory().filter((r): r is NightRecord => r.type === 'night').slice(0, 30).reverse()
  if (hist.length < 2) return <p className="empty-msg">至少需要 2 条记录才能显示趋势</p>

  const labels = hist.map(r => {
    const d = new Date(r.bed || r.slp || r.wakes[0] || r.up || 0)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => `${ctx.parsed.y.toFixed(1)}h` } } },
    scales: {
      x: { ticks: { color: '#5c5f66', font: { size: 10 } }, grid: { color: '#2c2e33' } },
      y: { ticks: { color: '#5c5f66', callback: (v: any) => `${v}h` }, grid: { color: '#2c2e33' }, min: 0 },
    },
  }

  const charts = [
    { title: '睡眠时长', data: hist.map(r => r.slp && r.wakes.length ? toHours(r.wakes[r.wakes.length - 1] - r.slp) : null), color: '#4ade80' },
    { title: '入睡耗时', data: hist.map(r => r.trySlp && r.slp ? toHours(r.slp - r.trySlp) : null), color: '#f59e0b' },
    { title: '赖床时间', data: hist.map(r => r.wakes.length && r.up ? toHours(r.up - r.wakes[r.wakes.length - 1]) : null), color: '#f87171' },
    { title: '在床总时长', data: hist.map(r => r.bed && r.up ? toHours(r.up - r.bed) : null), color: '#a78bfa' },
  ]

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">近 {hist.length} 晚趋势</Text>
      {charts.map(({ title, data, color }) => (
        <div key={title} className="trend-card">
          <Text size="xs" c="dimmed" mb={4}>{title}</Text>
          <Line data={{ labels, datasets: [{ data, borderColor: color, backgroundColor: color + '33', tension: 0.3, spanGaps: true, pointRadius: 3 }] }} options={chartOpts} />
        </div>
      ))}
    </Stack>
  )
}
