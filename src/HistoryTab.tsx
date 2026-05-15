import { useState, useRef } from 'react'
import { Card, Button, Text, Stack, Group, Modal, SimpleGrid, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { getHistory, setHistory, SleepEntry, NightRecord, NapRecord, dur, fmtTime, fmtDateTime } from './store'

export default function HistoryTab() {
  const [hist, setHist] = useState(getHistory)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [pickerOpened, setPickerOpened] = useState(false)
  const [timeValue, setTimeValue] = useState('')
  const [dateValue, setDateValue] = useState('')
  const editFieldRef = useRef<{ field: string; wakeIdx?: number } | null>(null)

  if (!hist.length) return <Text c="dimmed" ta="center" py="xl">暂无记录</Text>

  function save(updated: SleepEntry[]) { setHistory(updated); setHist(updated) }
  const editingRecord = editIndex !== null ? hist[editIndex] : null

  function editField(field: string, wakeIdx?: number) {
    if (editIndex === null) return
    editFieldRef.current = { field, wakeIdx }
    const rec = hist[editIndex]
    let ts: number | undefined
    if (rec.type === 'night') {
      ts = field === 'wakes' && wakeIdx !== undefined ? rec.wakes[wakeIdx] : (rec as any)[field]
    } else {
      ts = (rec as any)[field]
    }
    const d = ts ? new Date(ts) : new Date()
    setTimeValue(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    setDateValue(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    setPickerOpened(true)
  }

  function handlePickerSubmit() {
    if (editIndex === null || !editFieldRef.current || !timeValue || !dateValue) return
    const { field, wakeIdx } = editFieldRef.current
    const [h, m] = timeValue.split(':').map(Number)
    const [y, mo, day] = dateValue.split('-').map(Number)
    const ts = new Date(y, mo - 1, day, h, m, 0, 0).getTime()
    const rec = { ...hist[editIndex] } as any
    if (field === 'wakes' && wakeIdx !== undefined) {
      rec.wakes = [...rec.wakes]; rec.wakes[wakeIdx] = ts
    } else { rec[field] = ts }
    const updated = [...hist]; updated[editIndex] = rec; save(updated)
    setPickerOpened(false)
  }

  function deleteRecord() {
    if (editIndex === null) return
    const idx = editIndex; setEditIndex(null)
    save(hist.filter((_, i) => i !== idx))
    notifications.show({ message: '已删除', position: 'bottom-center', autoClose: 2000 })
  }

  function deleteWake(wakeIdx: number) {
    if (editIndex === null) return
    const rec = hist[editIndex] as NightRecord
    const updated = [...hist]
    updated[editIndex] = { ...rec, wakes: rec.wakes.filter((_, i) => i !== wakeIdx) }
    save(updated)
  }

  function addWake() {
    if (editIndex === null) return
    const rec = hist[editIndex] as NightRecord
    const updated = [...hist]
    updated[editIndex] = { ...rec, wakes: [...rec.wakes, Date.now()] }
    save(updated)
  }

  // Stats (nights only)
  const nights = hist.filter((r): r is NightRecord => r.type === 'night').slice(0, 7)
  const avg = (k1: string, k2: string) => {
    const vals = nights.filter(r => {
      const v1 = k1 === 'wakes' ? r.wakes[r.wakes.length - 1] : (r as any)[k1]
      const v2 = k2 === 'wakes' ? r.wakes[0] : (r as any)[k2]
      return v1 && v2
    }).map(r => {
      const v1 = k1 === 'wakes' ? r.wakes[r.wakes.length - 1] : (r as any)[k1]
      const v2 = k2 === 'wakes' ? r.wakes[0] : (r as any)[k2]
      return Math.abs(v2 - v1)
    })
    return vals.length ? dur(vals.reduce((a, b) => a + b, 0) / vals.length) : '-'
  }

  function exportCSV() {
    const rows = hist.map(r => {
      if (r.type === 'nap') return `nap,${r.start ? new Date(r.start).toISOString() : ''},${r.end ? new Date(r.end).toISOString() : ''}`
      const fmt = (t?: number) => t ? new Date(t).toISOString() : ''
      return `night,${fmt(r.bed)},${fmt(r.trySlp)},${fmt(r.slp)},${r.wakes.map(w => new Date(w).toISOString()).join(';')},${fmt(r.up)}`
    })
    const blob = new Blob(['type,data\n' + rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `sleep-data-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  }

  function exportJSON() {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(hist, null, 2)], { type: 'application/json' }))
    a.download = `sleep-data-${new Date().toISOString().slice(0, 10)}.json`; a.click()
  }

  return (
    <>
      <Group gap="xs" mb="sm">
        <Button variant="default" size="xs" flex={1} onClick={exportCSV}>导出 CSV</Button>
        <Button variant="default" size="xs" flex={1} onClick={exportJSON}>导出 JSON</Button>
      </Group>
      {nights.length > 0 && (
        <Card radius="md" withBorder mb="sm">
          <Text size="xs" c="dimmed" mb="xs">近 {nights.length} 晚平均</Text>
          <SimpleGrid cols={2}>
            <div><Text size="xs" c="dimmed">入睡耗时</Text><Text size="sm" fw={600}>{avg('trySlp', 'slp')}</Text></div>
            <div><Text size="xs" c="dimmed">睡眠时长</Text><Text size="sm" fw={600}>{avg('slp', 'wakes')}</Text></div>
            <div><Text size="xs" c="dimmed">在床时长</Text><Text size="sm" fw={600}>{avg('bed', 'up')}</Text></div>
            <div><Text size="xs" c="dimmed">赖床时间</Text><Text size="sm" fw={600}>{avg('wakes', 'up')}</Text></div>
          </SimpleGrid>
        </Card>
      )}
      <Text size="sm" c="dimmed" mb="xs">历史记录</Text>
      <Stack gap="xs">
        {hist.map((r, i) => {
          if (r.type === 'nap') {
            const napDur = r.start && r.end ? dur(r.end - r.start) : ''
            const d = new Date(r.end || r.start || 0)
            return (
              <Card key={i} radius="sm" withBorder padding="xs" onClick={() => setEditIndex(i)} style={{ cursor: 'pointer' }}>
                <Group><Text size="sm">☀️ {d.toLocaleDateString('zh-CN')}</Text>{napDur && <Text size="xs" c="green">💤 {napDur}</Text>}</Group>
                <Text size="xs" c="dimmed">入睡 {r.start ? fmtTime(r.start) : '-'} → 醒来 {r.end ? fmtTime(r.end) : '-'}</Text>
              </Card>
            )
          }
          const d = new Date(r.up || r.wakes[r.wakes.length - 1] || r.slp || r.bed || 0)
          const sleepMs = r.slp && r.wakes[0] ? r.wakes[0] - r.slp : 0
          return (
            <Card key={i} radius="sm" withBorder padding="xs" onClick={() => setEditIndex(i)} style={{ cursor: 'pointer' }}>
              <Group><Text size="sm">🌙 {d.toLocaleDateString('zh-CN')}</Text>{sleepMs > 0 && <Text size="xs" c="green">💤 {dur(sleepMs)}</Text>}</Group>
              <Text size="xs" c="dimmed">上床 {r.bed ? fmtTime(r.bed) : '-'} → 入睡 {r.slp ? fmtTime(r.slp) : '-'} → 醒 {r.wakes.length}次 → 起床 {r.up ? fmtTime(r.up) : '-'}</Text>
            </Card>
          )
        })}
      </Stack>

      {/* Edit modal */}
      <Modal opened={editIndex !== null && !pickerOpened} onClose={() => setEditIndex(null)} title="编辑记录" centered>
        {editingRecord && editingRecord.type === 'night' && (
          <Stack>
            {(['bed', 'trySlp', 'slp', 'up'] as const).map(f => (
              <Group key={f} justify="space-between" onClick={() => editField(f)} style={{ cursor: 'pointer' }}>
                <Text size="sm">{{ bed: '上床', trySlp: '尝试入睡', slp: '入睡', up: '起床' }[f]}</Text>
                <Text size="sm" c="green">{editingRecord[f] ? fmtDateTime(editingRecord[f]!) : '-'} ✏️</Text>
              </Group>
            ))}
            {editingRecord.wakes.map((w, wi) => (
              <Group key={wi} justify="space-between">
                <Text size="sm" onClick={() => editField('wakes', wi)} style={{ cursor: 'pointer', flex: 1 }}>醒来 #{wi + 1}: {fmtDateTime(w)} ✏️</Text>
                <Button variant="subtle" color="red" size="xs" onClick={() => deleteWake(wi)}>删除</Button>
              </Group>
            ))}
            <Button variant="subtle" size="xs" onClick={addWake}>+ 添加醒来</Button>
            <Button color="red" variant="light" fullWidth onClick={deleteRecord} mt="md">删除此记录</Button>
          </Stack>
        )}
        {editingRecord && editingRecord.type === 'nap' && (
          <Stack>
            {(['start', 'end'] as const).map(f => (
              <Group key={f} justify="space-between" onClick={() => editField(f)} style={{ cursor: 'pointer' }}>
                <Text size="sm">{{ start: '入睡', end: '醒来' }[f]}</Text>
                <Text size="sm" c="green">{editingRecord[f] ? fmtDateTime(editingRecord[f]!) : '-'} ✏️</Text>
              </Group>
            ))}
            <Button color="red" variant="light" fullWidth onClick={deleteRecord} mt="md">删除此记录</Button>
          </Stack>
        )}
      </Modal>

      {/* Time picker */}
      <Modal opened={pickerOpened} onClose={() => setPickerOpened(false)} title="调整时间" centered>
        <Stack>
          <Group grow>
            <TextInput type="date" value={dateValue} onChange={(e) => setDateValue(e.currentTarget.value)} label="日期" />
            <TextInput type="time" value={timeValue} onChange={(e) => setTimeValue(e.currentTarget.value)} label="时间" />
          </Group>
          <Button onClick={() => { handlePickerSubmit(); setPickerOpened(false) }} fullWidth>确定</Button>
        </Stack>
      </Modal>
    </>
  )
}
