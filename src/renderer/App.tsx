import { useEffect, useState } from 'react'
import type { TabsState, Settings } from '../shared/types'
import TabBar from './components/TabBar'
import Toolbar from './components/Toolbar'
import FindBar from './components/FindBar'
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
  const [showFind, setShowFind] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    window.electron.getState().then(setState)
    window.electron.getSettings().then(setSettings)

    const cleans = [
      window.electron.onTabsUpdate(setState),
      window.electron.onPopupConfirm(setPopup),
      window.electron.onSettingsUpdate(setSettings),
      window.electron.onContentFullscreen(setFullscreen),
      window.electron.onFindOpen(() => setShowFind(true)),
    ]

    const onResize = (): void => window.electron.reportResize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onResize)
    onResize()

    return () => { cleans.forEach(c => c()); window.removeEventListener('resize', onResize) }
  }, [])

  const activeTab = state.tabs.find(t => t.id === state.activeTabId)

  function closeFind(): void {
    setShowFind(false)
    window.electron.findClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a' }}>
      {!fullscreen && (
        <>
          <TabBar tabs={state.tabs} activeTabId={state.activeTabId} />
          <Toolbar
            url={activeTab?.url ?? ''}
            loading={activeTab?.loading ?? false}
            canGoBack={activeTab?.canGoBack ?? false}
            canGoForward={activeTab?.canGoForward ?? false}
            adBlockerEnabled={state.adBlockerEnabled}
            zoom={activeTab?.zoom ?? 1.0}
            onOpenSettings={() => { window.electron.viewHide(); setShowSettings(true) }}
          />
          {showFind && <FindBar onClose={closeFind} />}
        </>
      )}

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
