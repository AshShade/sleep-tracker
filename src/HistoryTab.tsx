import { useTranslation } from 'react-i18next'
import { useState, useRef } from 'react'
import { Card, Button, Text, Stack, Group, Modal, SimpleGrid, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { getHistory, setHistory, SleepEntry, NightRecord, dur, fmtTime, fmtDateTime } from './store'

export default function HistoryTab() {
  const { t } = useTranslation()
  const [hist, setHist] = useState(getHistory)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [pickerOpened, setPickerOpened] = useState(false)
  const [timeValue, setTimeValue] = useState('')
  const [dateValue, setDateValue] = useState('')
  const editFieldRef = useRef<{ field: string; wakeIdx?: number } | null>(null)

  if (!hist.length) return <Text c="dimmed" ta="center" py="xl">{t('no_records')}</Text>

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
    notifications.show({ message: t('deleted'), position: 'bottom-center', autoClose: 2000 })
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
      const v2 = k2 === 'wakes' ? r.wakes[r.wakes.length - 1] : (r as any)[k2]
      return v1 && v2
    }).map(r => {
      const v1 = k1 === 'wakes' ? r.wakes[r.wakes.length - 1] : (r as any)[k1]
      const v2 = k2 === 'wakes' ? r.wakes[r.wakes.length - 1] : (r as any)[k2]
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
        <Button variant="default" size="xs" flex={1} onClick={exportCSV}>{t('export_csv')}</Button>
        <Button variant="default" size="xs" flex={1} onClick={exportJSON}>{t('export_json')}</Button>
      </Group>
      {nights.length > 0 && (
        <Card radius="md" withBorder mb="sm">
          <Text size="xs" c="dimmed" mb="xs">{t('avg_title', { count: nights.length })}</Text>
          <SimpleGrid cols={2}>
            <div><Text size="xs" c="dimmed">{t('onset_latency')}</Text><Text size="sm" fw={600}>{avg('trySlp', 'slp')}</Text></div>
            <div><Text size="xs" c="dimmed">{t('sleep_duration')}</Text><Text size="sm" fw={600}>{avg('slp', 'wakes')}</Text></div>
            <div><Text size="xs" c="dimmed">{t('in_bed')}</Text><Text size="sm" fw={600}>{avg('bed', 'up')}</Text></div>
            <div><Text size="xs" c="dimmed">{t('snooze')}</Text><Text size="sm" fw={600}>{avg('wakes', 'up')}</Text></div>
          </SimpleGrid>
        </Card>
      )}
      <Text size="sm" c="dimmed" mb="xs">{t('history')}</Text>
      <Stack gap="xs">
        {hist.map((r, i) => {
          if (r.type === 'nap') {
            const napDur = r.start && r.end ? dur(r.end - r.start) : ''
            const d = new Date(r.end || r.start || 0)
            return (
              <Card key={i} radius="sm" withBorder padding="xs" onClick={() => setEditIndex(i)} style={{ cursor: 'pointer' }}>
                <Group><Text size="sm">☀️ {d.toLocaleDateString('zh-CN')}</Text>{napDur && <Text size="xs" c="green">💤 {napDur}</Text>}</Group>
                <Text size="xs" c="dimmed">{t('nap_start')} {r.start ? fmtTime(r.start) : '-'} → {t('nap_end')} {r.end ? fmtTime(r.end) : '-'}</Text>
              </Card>
            )
          }
          const d = new Date(r.up || r.wakes[r.wakes.length - 1] || r.slp || r.bed || 0)
          const sleepMs = r.slp && r.wakes[r.wakes.length - 1] ? r.wakes[r.wakes.length - 1] - r.slp : 0
          return (
            <Card key={i} radius="sm" withBorder padding="xs" onClick={() => setEditIndex(i)} style={{ cursor: 'pointer' }}>
              <Group><Text size="sm">🌙 {d.toLocaleDateString('zh-CN')}</Text>{sleepMs > 0 && <Text size="xs" c="green">💤 {dur(sleepMs)}</Text>}</Group>
              <Text size="xs" c="dimmed">{t('bed')} {r.bed ? fmtTime(r.bed) : '-'} → {t('slp')} {r.slp ? fmtTime(r.slp) : '-'} → {t('wake')} {r.wakes.length} → {t('up')} {r.up ? fmtTime(r.up) : '-'}</Text>
            </Card>
          )
        })}
      </Stack>

      {/* Edit modal */}
      <Modal opened={editIndex !== null && !pickerOpened} onClose={() => setEditIndex(null)} title={t('edit_record')} centered>
        {editingRecord && editingRecord.type === 'night' && (
          <Stack>
            {(['bed', 'trySlp', 'slp', 'up'] as const).map(f => (
              <Group key={f} justify="space-between" onClick={() => editField(f)} style={{ cursor: 'pointer' }}>
                <Text size="sm">{t(f)}</Text>
                <Text size="sm" c="green">{editingRecord[f] ? fmtDateTime(editingRecord[f]!) : '-'} ✏️</Text>
              </Group>
            ))}
            {editingRecord.wakes.map((w, wi) => (
              <Group key={wi} justify="space-between">
                <Text size="sm" onClick={() => editField('wakes', wi)} style={{ cursor: 'pointer', flex: 1 }}>{t('wake_n', { n: wi + 1 })}: {fmtDateTime(w)} ✏️</Text>
                <Button variant="subtle" color="red" size="xs" onClick={() => deleteWake(wi)}>{t('delete')}</Button>
              </Group>
            ))}
            <Button variant="subtle" size="xs" onClick={addWake}>{t('add_wake')}</Button>
            <Button color="red" variant="light" fullWidth onClick={deleteRecord} mt="md">{t('delete_record')}</Button>
          </Stack>
        )}
        {editingRecord && editingRecord.type === 'nap' && (
          <Stack>
            {(['start', 'end'] as const).map(f => (
              <Group key={f} justify="space-between" onClick={() => editField(f)} style={{ cursor: 'pointer' }}>
                <Text size="sm">{t(f === 'start' ? 'nap_start' : 'nap_end')}</Text>
                <Text size="sm" c="green">{editingRecord[f] ? fmtDateTime(editingRecord[f]!) : '-'} ✏️</Text>
              </Group>
            ))}
            <Button color="red" variant="light" fullWidth onClick={deleteRecord} mt="md">{t('delete_record')}</Button>
          </Stack>
        )}
      </Modal>

      {/* Time picker */}
      <Modal opened={pickerOpened} onClose={() => setPickerOpened(false)} title={t('adjust_time')} centered>
        <Stack>
          <Group grow>
            <TextInput type="date" value={dateValue} onChange={(e) => setDateValue(e.currentTarget.value)} label={t('date')} />
            <TextInput type="time" value={timeValue} onChange={(e) => setTimeValue(e.currentTarget.value)} label={t('time')} />
          </Group>
          <Button onClick={() => { handlePickerSubmit(); setPickerOpened(false) }} fullWidth>{t('confirm_yes')}</Button>
        </Stack>
      </Modal>
    </>
  )
}
