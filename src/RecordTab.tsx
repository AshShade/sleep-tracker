import { useState, useRef } from 'react'
import { Card, Button, Toast, DatePicker, Modal } from 'antd-mobile'
import { STEPS, SleepRecord, getTonight, setTonight, archiveAndReset, fmtTime } from './store'

export default function RecordTab() {
  const [record, setRecord] = useState<SleepRecord>(getTonight)
  const [pickerVisible, setPickerVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const editingRef = useRef<keyof SleepRecord | null>(null)

  function tap(key: keyof SleepRecord) {
    if (record[key]) {
      editingRef.current = key
      setPickerVisible(true)
    } else {
      const updated = { ...record, [key]: Date.now() }
      setTonight(updated)
      setRecord(updated)
      Toast.show({ content: `${STEPS.find(s => s.key === key)!.label} ✓`, position: 'bottom' })
    }
  }

  /* v8 ignore start */
  function handlePickerConfirm(val: Date) {
    const key = editingRef.current
    if (!key) return
    const base = record[key] ? new Date(record[key]!) : new Date()
    base.setHours(val.getHours(), val.getMinutes(), 0, 0)
    const updated = { ...record, [key]: base.getTime() }
    setTonight(updated)
    setRecord(updated)
    setPickerVisible(false)
  }

  const pickerDefault = () => {
    const key = editingRef.current
    return key && record[key] ? new Date(record[key]!) : new Date()
  }
  /* v8 ignore stop */

  function doSubmit() {
    setConfirmVisible(false)
    archiveAndReset(record)
    setRecord({})
    Toast.show({ icon: 'success', content: '已归档，晚安 🌙' })
  }

  return (
    <div className="record-page">
      <h1 className="record-title">🌙 睡眠记录</h1>
      <div className="record-steps">
        {STEPS.map(({ key, label }) => (
          <Card key={key} onClick={() => tap(key)} className={`step-card ${record[key] ? 'recorded' : ''}`}>
            <div className="step-inner">
              <span className="step-label">{label}</span>
              {record[key] && <div className="step-time">{fmtTime(record[key]!)} ✏️</div>}
            </div>
          </Card>
        ))}
      </div>
      {Object.keys(record).length > 0 && (
        <div className="submit-area">
          <Button block color="primary" size="large" className="submit-btn" onClick={() => setConfirmVisible(true)}>
            提交记录 ✓
          </Button>
        </div>
      )}
      {/* v8 ignore start */}
      <DatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={handlePickerConfirm}
        precision="minute"
        defaultValue={pickerDefault()}
        min={new Date(new Date().getFullYear(), 0, 1)}
        max={new Date()}
      />
      {/* v8 ignore stop */}
      <Modal
        visible={confirmVisible}
        content="确认提交本次睡眠记录？"
        closeOnAction
        onClose={() => setConfirmVisible(false)}
        actions={[
          { key: 'cancel', text: '取消', onClick: () => setConfirmVisible(false) },
          { key: 'confirm', text: '确认', primary: true, onClick: doSubmit },
        ]}
      />
    </div>
  )
}
