import { List, Card, Grid, Button, Empty } from 'antd-mobile'
import { getHistory, SleepRecord, dur, fmtTime } from './store'

export default function HistoryTab() {
  const hist = getHistory()
  if (!hist.length) return <Empty description="暂无记录" />

  const recent = hist.slice(0, 7)
  const avg = (k1: keyof SleepRecord, k2: keyof SleepRecord) => {
    const vals = recent.filter(r => r[k1] && r[k2]).map(r => r[k2]! - r[k1]!)
    return vals.length ? dur(vals.reduce((a, b) => a + b, 0) / vals.length) : '-'
  }

  function exportCSV() {
    const header = 'date,bed,trySlp,slp,wake,up\n'
    const rows = hist.map(r => {
      const d = new Date(r.bed || r.slp || r.wake || r.up || 0).toLocaleDateString('zh-CN')
      const fmt = (t?: number) => t ? new Date(t).toISOString() : ''
      return `${d},${fmt(r.bed)},${fmt(r.trySlp)},${fmt(r.slp)},${fmt(r.wake)},${fmt(r.up)}`
    }).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sleep-data-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(hist, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sleep-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  return (
    <>
      <div className="export-row">
        <Button fill="outline" size="small" block onClick={exportCSV}>导出 CSV</Button>
        <Button fill="outline" size="small" block onClick={exportJSON}>导出 JSON</Button>
      </div>
      <Card title={`近 ${recent.length} 晚平均`} className="stats-card">
        <Grid columns={2} gap={4}>
          <Grid.Item><span className="stats-label">入睡耗时</span><br /><strong className="stats-value">{avg('trySlp', 'slp')}</strong></Grid.Item>
          <Grid.Item><span className="stats-label">睡眠时长</span><br /><strong className="stats-value">{avg('slp', 'wake')}</strong></Grid.Item>
          <Grid.Item><span className="stats-label">在床时长</span><br /><strong className="stats-value">{avg('bed', 'up')}</strong></Grid.Item>
          <Grid.Item><span className="stats-label">赖床时间</span><br /><strong className="stats-value">{avg('wake', 'up')}</strong></Grid.Item>
        </Grid>
      </Card>
      <List header="历史记录">
        {hist.map((r, i) => {
          const d = new Date(r.bed || r.slp || r.wake || r.up || 0)
          const fmt = (t?: number) => t ? fmtTime(t) : '-'
          const sleep = r.slp && r.wake ? `💤 ${dur(r.wake - r.slp)}` : ''
          return (
            <List.Item key={i} description={`上床 ${fmt(r.bed)} → 入睡 ${fmt(r.slp)} → 醒来 ${fmt(r.wake)} → 起床 ${fmt(r.up)}`}>
              <span className="hist-date">{d.toLocaleDateString('zh-CN')}</span>{' '}
              <span className="hist-sleep">{sleep}</span>
            </List.Item>
          )
        })}
      </List>
    </>
  )
}
