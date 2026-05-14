import { useState } from 'react'
import { TabBar } from 'antd-mobile'
import { ClockCircleOutline, HistogramOutline, FileOutline } from 'antd-mobile-icons'
import RecordTab from './RecordTab'
import HistoryTab from './HistoryTab'
import TrendTab from './TrendTab'

type Tab = 'record' | 'history' | 'trend'

export default function App() {
  const [tab, setTab] = useState<Tab>('record')

  return (
    <div className="app-container">
      <div className="app-content">
        {tab === 'record' && <RecordTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'trend' && <TrendTab />}
      </div>
      <TabBar activeKey={tab} onChange={k => setTab(k as Tab)} className="tab-border">
        <TabBar.Item key="record" icon={<ClockCircleOutline />} title="记录" />
        <TabBar.Item key="history" icon={<FileOutline />} title="历史" />
        <TabBar.Item key="trend" icon={<HistogramOutline />} title="趋势" />
      </TabBar>
    </div>
  )
}
