import { Globe, Plus, X } from 'lucide-react'
import type { TabInfo } from '../../shared/types'

interface Props {
  tabs: TabInfo[]
  activeTabId: number
}

function Tab({ tab, isActive }: { tab: TabInfo; isActive: boolean }): JSX.Element {
  return (
    <div
      onClick={() => window.electron.switchTab(tab.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '0 16px', height: '100%',
        maxWidth: '240px', minWidth: '140px',
        cursor: 'pointer', overflow: 'hidden',
        borderRadius: '8px 8px 0 0',
        borderTop: isActive ? '1px solid #2e2e2e' : '1px solid transparent',
        borderLeft: isActive ? '1px solid #2e2e2e' : '1px solid transparent',
        borderRight: isActive ? '1px solid #2e2e2e' : '1px solid transparent',
        background: isActive ? '#161616' : 'transparent',
        color: isActive ? '#f4f4f5' : '#71717a',
        fontSize: '13px', transition: 'background 0.15s, color 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#111111' }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
    >
      {tab.favicon
        ? <img src={tab.favicon} style={{ width: 15, height: 15, flexShrink: 0 }} alt="" />
        : <Globe size={14} style={{ flexShrink: 0, color: '#71717a' }} />
      }
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {tab.title || tab.url}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); window.electron.closeTab(tab.id) }}
        style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 20, height: 20, border: 'none', background: 'transparent',
          borderRadius: 6, cursor: 'pointer', color: '#71717a',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#3f3f46')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <X size={11} />
      </button>
    </div>
  )
}

export default function TabBar({ tabs, activeTabId }: Props): JSX.Element {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      height: 56, background: '#0a0a0a',
      padding: '12px 32px 0 32px', gap: 4,
      userSelect: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flex: 1, height: '100%', overflow: 'hidden' }}>
        {tabs.map(tab => (
          <Tab key={tab.id} tab={tab} isActive={tab.id === activeTabId} />
        ))}
        <button
          onClick={() => window.electron.newTab()}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, marginBottom: 2, border: 'none',
            background: 'transparent', borderRadius: 8, cursor: 'pointer', color: '#71717a',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1e1e1e'; (e.currentTarget as HTMLButtonElement).style.color = '#d4d4d8' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#71717a' }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
