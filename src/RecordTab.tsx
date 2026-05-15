import { useState } from 'react'
import { Card, Button, Modal, ActionIcon, Group, Text, Stack } from '@mantine/core'
import { TimeInput, DateInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { STEPS, SleepRecord, getTonight, setTonight, archiveAndReset, fmtTime } from './store'

type StepKey = keyof Omit<SleepRecord, 'wakes'>

export default function RecordTab() {
  const [record, setRecord] = useState<SleepRecord>(getTonight)
  const [pickerOpened, setPickerOpened] = useState(false)
  const [confirmOpened, setConfirmOpened] = useState(false)
  const [actionTarget, setActionTarget] = useState<{ type: 'step'; key: StepKey } | { type: 'wake'; idx: number } | null>(null)
  const [timeValue, setTimeValue] = useState('')
  const [dateValue, setDateValue] = useState<Date | null>(null)

  function openPicker(target: typeof actionTarget) {
    setActionTarget(target)
    if (target) {
      const ts = target.type === 'step' ? record[target.key]! : record.wakes[target.idx]
      const d = new Date(ts)
      setTimeValue(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
      setDateValue(d)
    }
    setPickerOpened(true)
  }

  function tap(key: StepKey) {
    if (record[key]) {
      openPicker({ type: 'step', key })
    } else {
      const updated = { ...record, [key]: Date.now() }
      setTonight(updated)
      setRecord(updated)
      notifications.show({ message: `${STEPS.find(s => s.key === key)!.label} ✓`, position: 'bottom-center', autoClose: 2000 })
    }
  }

  function addWake() {
    const updated = { ...record, wakes: [...record.wakes, Date.now()] }
    setTonight(updated)
    setRecord(updated)
    notifications.show({ message: `醒来 #${updated.wakes.length} ✓`, position: 'bottom-center', autoClose: 2000 })
  }

  function editWake(idx: number) {
    openPicker({ type: 'wake', idx })
  }

  function deleteWake(idx: number) {
    const updated = { ...record, wakes: record.wakes.filter((_, i) => i !== idx) }
    setTonight(updated)
    setRecord(updated)
  }

  function handlePickerSubmit() {
    if (!actionTarget || !timeValue || !dateValue) return
    const [h, m] = timeValue.split(':').map(Number)
    const d = new Date(dateValue)
    d.setHours(h, m, 0, 0)
    if (actionTarget.type === 'step') {
      const updated = { ...record, [actionTarget.key]: d.getTime() }
      setTonight(updated)
      setRecord(updated)
    } else {
      const wakes = [...record.wakes]
      wakes[actionTarget.idx] = d.getTime()
      const updated = { ...record, wakes }
      setTonight(updated)
      setRecord(updated)
    }
    setPickerOpened(false)
  }

  const [skipSaveOnClose, setSkipSaveOnClose] = useState(false)

  function setToNow() {
    if (!actionTarget) return
    if (actionTarget.type === 'step') {
      const updated = { ...record, [actionTarget.key]: Date.now() }
      setTonight(updated)
      setRecord(updated)
    } else {
      const wakes = [...record.wakes]
      wakes[actionTarget.idx] = Date.now()
      const updated = { ...record, wakes }
      setTonight(updated)
      setRecord(updated)
    }
    setSkipSaveOnClose(true)
    setPickerOpened(false)
    notifications.show({ message: '已更新为此刻 ✓', position: 'bottom-center', autoClose: 2000 })
  }

  function doSubmit() {
    setConfirmOpened(false)
    archiveAndReset(record)
    setRecord({ wakes: [] })
    notifications.show({ message: '已归档，晚安 🌙', position: 'bottom-center', autoClose: 3000 })
  }

  const hasData = record.bed || record.trySlp || record.slp || record.wakes.length || record.up

  return (
    <div className="record-page">
      <h1 className="record-title">🌙 睡眠记录</h1>
      <Stack gap="xs">
        {STEPS.map(({ key, label }) => (
          <Card key={key} onClick={() => tap(key)} className={`step-card ${record[key] ? 'recorded' : ''}`} padding="md" radius="md" withBorder>
            <Text ta="center" size="lg">{label}</Text>
            {record[key] && <Text ta="center" size="sm" c="green">{fmtTime(record[key]!)} ✏️</Text>}
          </Card>
        ))}
        <Card onClick={addWake} className={`step-card ${record.wakes.length ? 'recorded' : ''}`} padding="md" radius="md" withBorder>
          <Text ta="center" size="lg">醒来{record.wakes.length > 0 && ` (${record.wakes.length}次)`}</Text>
        </Card>
        {record.wakes.map((w, i) => (
          <Group key={i} gap="xs" className="wake-item">
            <Text size="sm" c="green" style={{ flex: 1, cursor: 'pointer' }} onClick={() => editWake(i)}>
              醒来 #{i + 1}: {fmtTime(w)} ✏️
            </Text>
            <ActionIcon variant="subtle" color="red" size="sm" onClick={() => deleteWake(i)}>✕</ActionIcon>
          </Group>
        ))}
      </Stack>

      {hasData && (
        <div className="submit-area">
          <Button fullWidth size="lg" radius="md" onClick={() => setConfirmOpened(true)}>提交记录 ✓</Button>
        </div>
      )}

      {/* Time picker modal */}
      <Modal opened={pickerOpened} onClose={() => { if (!skipSaveOnClose) handlePickerSubmit(); setSkipSaveOnClose(false); setPickerOpened(false) }} title="调整时间" centered>
        <Stack>
          <Group grow>
            <DateInput value={dateValue} onChange={(v) => setDateValue(v ? new Date(v) : null)} label="日期" />
            <TimeInput value={timeValue} onChange={(e) => setTimeValue(e.currentTarget.value)} label="时间" />
          </Group>
          <Button variant="light" onClick={setToNow} fullWidth>📍 此刻</Button>
        </Stack>
      </Modal>

      {/* Submit confirmation */}
      <Modal opened={confirmOpened} onClose={() => setConfirmOpened(false)} title="确认" centered>
        <Text>确认提交本次睡眠记录？</Text>
        <Group mt="md">
          <Button variant="default" onClick={() => setConfirmOpened(false)} flex={1}>取消</Button>
          <Button onClick={doSubmit} flex={1}>确认</Button>
        </Group>
      </Modal>
    </div>
  )
}
