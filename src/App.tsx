import { useState } from 'react'
import { Tabs } from '@mantine/core'
import RecordTab from './RecordTab'
import HistoryTab from './HistoryTab'
import TrendTab from './TrendTab'

export default function App() {
  const [tab, setTab] = useState<string | null>('record')

  return (
    <div className="app-container">
      <div className="app-content">
        {tab === 'record' && <RecordTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'trend' && <TrendTab />}
      </div>
      <Tabs value={tab} onChange={setTab} className="app-tabs">
        <Tabs.List grow>
          <Tabs.Tab value="record">记录</Tabs.Tab>
          <Tabs.Tab value="history">历史</Tabs.Tab>
          <Tabs.Tab value="trend">趋势</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </div>
  )
}
