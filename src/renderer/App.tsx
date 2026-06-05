import { useEffect, useState } from 'react'
import type { TabsState, Settings } from '../shared/types'
import TabBar from './components/TabBar'
import Toolbar from './components/Toolbar'
import PopupModal from './components/PopupModal'
import SettingsModal from './components/SettingsModal'

const DEFAULT_STATE: TabsState = { tabs: [], activeTabId: 0, adBlockerEnabled: true }
const DEFAULT_SETTINGS: Settings = { blockingMode: 'default', autoBlockBlocked: false, blockedDomains: [] }

interface PopupRequest { url: string; from: string }

export default function App(): JSX.Element {
  const [state, setState] = useState<TabsState>(DEFAULT_STATE)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [popup, setPopup] = useState<PopupRequest | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    window.electron.getState().then(setState)
    window.electron.getSettings().then(setSettings)

    const cleanState = window.electron.onTabsUpdate(setState)
    const cleanPopup = window.electron.onPopupConfirm(setPopup)
    const cleanSettings = window.electron.onSettingsUpdate(setSettings)
    const cleanFs = window.electron.onContentFullscreen(setFullscreen)

    const onResize = (): void => window.electron.reportResize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onResize)
    onResize()

    return () => {
      cleanState(); cleanPopup(); cleanSettings(); cleanFs()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const activeTab = state.tabs.find(t => t.id === state.activeTabId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ flexShrink: 0, overflow: 'hidden', height: fullscreen ? 0 : 'auto', transition: 'height 0.15s ease' }}>
        <TabBar tabs={state.tabs} activeTabId={state.activeTabId} />
      </div>
      <div style={{ flexShrink: 0, overflow: 'hidden', height: fullscreen ? 0 : 'auto', transition: 'height 0.15s ease' }}>
      <Toolbar
        url={activeTab?.url ?? ''}
        loading={activeTab?.loading ?? false}
        canGoBack={activeTab?.canGoBack ?? false}
        canGoForward={activeTab?.canGoForward ?? false}
        adBlockerEnabled={state.adBlockerEnabled}
        onOpenSettings={() => { window.electron.viewHide(); setShowSettings(true) }}
      />
      </div>
      {popup && (
        <PopupModal
          url={popup.url}
          from={popup.from}
          onConfirm={() => { window.electron.popupOpen(popup.url); setPopup(null) }}
          onDeny={() => { window.electron.popupBlock(popup.url); setPopup(null) }}
        />
      )}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => { window.electron.viewShow(); setShowSettings(false) }}
        />
      )}
    </div>
  )
}
