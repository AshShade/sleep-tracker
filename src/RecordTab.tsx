import { useState } from 'react'
import { Card, Button, Modal, ActionIcon, Group, Text, Stack, TextInput, SegmentedControl } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { NightRecord, NapRecord, NIGHT_STEPS, NAP_STEPS, getTonight, setTonight, archiveNight, getCurrentNap, setCurrentNap, archiveNap, fmtTime } from './store'

type Mode = 'night' | 'nap'

export default function RecordTab() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('night')
  const [night, setNight] = useState<NightRecord>(getTonight)
  const [nap, setNap] = useState<NapRecord>(getCurrentNap)
  const [pickerOpened, setPickerOpened] = useState(false)
  const [confirmOpened, setConfirmOpened] = useState(false)
  const [timeValue, setTimeValue] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [editTarget, setEditTarget] = useState<{ mode: Mode; key: string; wakeIdx?: number } | null>(null)

  // --- Night ---
  function tapNight(key: keyof Omit<NightRecord, 'wakes' | 'type'>) {
    if (night[key]) {
      openPicker('night', key)
    } else {
      const updated = { ...night, [key]: Date.now() }
      setTonight(updated); setNight(updated)
      notifications.show({ message: t('recorded', { label: t(key) }), position: 'bottom-center', autoClose: 2000 })
    }
  }

  function addWake() {
    const updated = { ...night, wakes: [...night.wakes, Date.now()] }
    setTonight(updated); setNight(updated)
    notifications.show({ message: t('recorded', { label: t('wake') }), position: 'bottom-center', autoClose: 2000 })
  }

  function editWake(idx: number) { openPicker('night', 'wakes', idx) }
  function deleteWake(idx: number) {
    const updated = { ...night, wakes: night.wakes.filter((_, i) => i !== idx) }
    setTonight(updated); setNight(updated)
  }

  function submitNight() { setConfirmOpened(true) }
  function doSubmitNight() {
    setConfirmOpened(false); archiveNight(night); setNight({ type: 'night', wakes: [] })
    notifications.show({ message: t('archived_night'), position: 'bottom-center', autoClose: 3000 })
  }

  // --- Nap ---
  function tapNap(key: keyof Omit<NapRecord, 'type'>) {
    if (nap[key]) {
      openPicker('nap', key)
    } else {
      const updated = { ...nap, [key]: Date.now() }
      setCurrentNap(updated); setNap(updated)
      notifications.show({ message: t('recorded', { label: t(key === 'start' ? 'nap_start' : 'nap_end') }), position: 'bottom-center', autoClose: 2000 })
    }
  }

  function submitNap() {
    archiveNap(nap); setNap({ type: 'nap' })
    notifications.show({ message: t('archived_nap'), position: 'bottom-center', autoClose: 3000 })
  }

  // --- Shared picker ---
  function openPicker(m: Mode, key: string, wakeIdx?: number) {
    setEditTarget({ mode: m, key, wakeIdx })
    let ts: number
    if (m === 'night') {
      ts = key === 'wakes' ? night.wakes[wakeIdx!] : (night as any)[key]
    } else {
      ts = (nap as any)[key]
    }
    const d = new Date(ts)
    setTimeValue(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
    setDateValue(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    setPickerOpened(true)
  }

  function handlePickerSubmit() {
    if (!editTarget || !timeValue || !dateValue) return
    const [h, m] = timeValue.split(':').map(Number)
    const [y, mo, day] = dateValue.split('-').map(Number)
    const ts = new Date(y, mo - 1, day, h, m, 0, 0).getTime()
    if (editTarget.mode === 'night') {
      if (editTarget.key === 'wakes') {
        const wakes = [...night.wakes]; wakes[editTarget.wakeIdx!] = ts
        const updated = { ...night, wakes }; setTonight(updated); setNight(updated)
      } else {
        const updated = { ...night, [editTarget.key]: ts }; setTonight(updated); setNight(updated)
      }
    } else {
      const updated = { ...nap, [editTarget.key]: ts }; setCurrentNap(updated); setNap(updated)
    }
  }

  function setToNow() {
    if (!editTarget) return
    const ts = Date.now()
    if (editTarget.mode === 'night') {
      if (editTarget.key === 'wakes') {
        const wakes = [...night.wakes]; wakes[editTarget.wakeIdx!] = ts
        const updated = { ...night, wakes }; setTonight(updated); setNight(updated)
      } else {
        const updated = { ...night, [editTarget.key]: ts }; setTonight(updated); setNight(updated)
      }
    } else {
      const updated = { ...nap, [editTarget.key]: ts }; setCurrentNap(updated); setNap(updated)
    }
    setPickerOpened(false)
    notifications.show({ message: t('updated_now'), position: 'bottom-center', autoClose: 2000 })
  }

  const nightHasData = night.bed || night.trySlp || night.slp || night.wakes.length || night.up
  const napHasData = nap.start || nap.end

  return (
    <div className="record-page">
      <h1 className="record-title">🌙 {t('title')}</h1>
      <SegmentedControl fullWidth value={mode} onChange={(v) => setMode(v as Mode)} data={[
        { label: t('mode_night'), value: 'night' },
        { label: t('mode_nap'), value: 'nap' },
      ]} mb="sm" />

      {mode === 'night' ? (
        <Stack gap="xs">
          {NIGHT_STEPS.slice(0, 3).map(({ key }) => (
            <Card key={key} onClick={() => tapNight(key)} className={`step-card ${night[key] ? 'recorded' : ''}`} padding="md" radius="md" withBorder>
              <Text ta="center" size="lg">{t(key)}</Text>
              {night[key] && <Text ta="center" size="sm" c="green">{fmtTime(night[key]!)} ✏️</Text>}
            </Card>
          ))}
          <Card onClick={addWake} className={`step-card ${night.wakes.length ? 'recorded' : ''}`} padding="md" radius="md" withBorder>
            <Text ta="center" size="lg">{night.wakes.length > 0 ? t('wake_count', { count: night.wakes.length }) : t('wake')}</Text>
          </Card>
          {night.wakes.map((w, i) => (
            <Group key={i} gap="xs" className="wake-item">
              <Text size="sm" c="green" style={{ flex: 1, cursor: 'pointer' }} onClick={() => editWake(i)}>{t('wake_n', { n: i + 1 })}: {fmtTime(w)} ✏️</Text>
              <ActionIcon variant="subtle" color="red" size="sm" onClick={() => deleteWake(i)}>✕</ActionIcon>
            </Group>
          ))}
          {NIGHT_STEPS.slice(3).map(({ key }) => (
            <Card key={key} onClick={() => tapNight(key)} className={`step-card ${night[key] ? 'recorded' : ''}`} padding="md" radius="md" withBorder>
              <Text ta="center" size="lg">{t(key)}</Text>
              {night[key] && <Text ta="center" size="sm" c="green">{fmtTime(night[key]!)} ✏️</Text>}
            </Card>
          ))}
          {nightHasData && (
            <div className="submit-area">
              <Button fullWidth size="lg" radius="md" onClick={submitNight}>{t('submit_night')}</Button>
            </div>
          )}
        </Stack>
      ) : (
        <Stack gap="xs">
          {NAP_STEPS.map(({ key }) => (
            <Card key={key} onClick={() => tapNap(key)} className={`step-card ${nap[key] ? 'recorded' : ''}`} padding="md" radius="md" withBorder>
              <Text ta="center" size="lg">{t(key === 'start' ? 'nap_start' : 'nap_end')}</Text>
              {nap[key] && <Text ta="center" size="sm" c="green">{fmtTime(nap[key]!)} ✏️</Text>}
            </Card>
          ))}
          {napHasData && (
            <div className="submit-area">
              <Button fullWidth size="lg" radius="md" onClick={submitNap}>{t('submit_nap')}</Button>
            </div>
          )}
        </Stack>
      )}

      {/* Time picker modal */}
      <Modal opened={pickerOpened} onClose={() => setPickerOpened(false)} title={t('adjust_time')} centered>
        <Stack>
          <Group grow>
            <TextInput type="date" value={dateValue} onChange={(e) => setDateValue(e.currentTarget.value)} label={t('date')} />
            <TextInput type="time" value={timeValue} onChange={(e) => setTimeValue(e.currentTarget.value)} label={t('time')} />
          </Group>
          <Group grow>
            <Button variant="light" onClick={setToNow}>{t('now')}</Button>
            <Button onClick={() => { handlePickerSubmit(); setPickerOpened(false) }}>{t('confirm_yes')}</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Submit confirmation (night only) */}
      <Modal opened={confirmOpened} onClose={() => setConfirmOpened(false)} title={t('confirm_title')} centered>
        <Text>{t('confirm_submit')}</Text>
        <Group mt="md">
          <Button variant="default" onClick={() => setConfirmOpened(false)} flex={1}>{t('confirm_cancel')}</Button>
          <Button onClick={doSubmitNight} flex={1}>{t('confirm_yes')}</Button>
        </Group>
      </Modal>
    </div>
  )
}
