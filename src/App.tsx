import { useState, useEffect } from 'react'
import { Tabs } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import RecordTab from './RecordTab'
import HistoryTab from './HistoryTab'
import TrendTab from './TrendTab'

export default function App() {
  const [tab, setTab] = useState<string | null>('record')
  const { t } = useTranslation()

  useEffect(() => { document.title = `🌙 ${t('title')}` }, [t])

  return (
    <div className="app-container">
      <div className="app-content">
        {tab === 'record' && <RecordTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'trend' && <TrendTab />}
      </div>
      <Tabs value={tab} onChange={setTab} className="app-tabs">
        <Tabs.List grow>
          <Tabs.Tab value="record">{t('record')}</Tabs.Tab>
          <Tabs.Tab value="history">{t('history')}</Tabs.Tab>
          <Tabs.Tab value="trend">{t('trend')}</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </div>
  )
}
