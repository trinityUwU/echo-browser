import { useEffect, useState } from 'react'
import type { TabsState, Settings, ActiveDownload } from '../shared/types'
import TabBar from './components/TabBar'
import Toolbar from './components/Toolbar'
import FindBar from './components/FindBar'
import PopupModal from './components/PopupModal'
import SettingsModal from './components/SettingsModal'
import BookmarksPanel from './components/BookmarksPanel'
import HistoryPanel from './components/HistoryPanel'
import DownloadsPanel from './components/DownloadsPanel'

const DEFAULT_STATE: TabsState = { tabs: [], activeTabId: 0, adBlockerEnabled: true, isBookmarked: false }
const DEFAULT_SETTINGS: Settings = { blockingMode: 'default', autoBlockBlocked: false, blockedDomains: [] }

type Panel = 'settings' | 'bookmarks' | 'history' | 'downloads' | null
interface PopupRequest { url: string; from: string }

export default function App(): JSX.Element {
  const [state, setState] = useState<TabsState>(DEFAULT_STATE)
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [popup, setPopup] = useState<PopupRequest | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [showFind, setShowFind] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [downloads, setDownloads] = useState<ActiveDownload[]>([])

  function openPanel(p: Panel): void {
    window.electron.viewHide()
    setPanel(p)
  }
  function closePanel(): void {
    window.electron.viewShow()
    setPanel(null)
  }
  function navigate(url: string): void {
    window.electron.viewShow()
    window.electron.navigate(url)
    setPanel(null)
  }

  useEffect(() => {
    window.electron.getState().then(setState)
    window.electron.getSettings().then(setSettings)

    const cleans = [
      window.electron.onTabsUpdate(setState),
      window.electron.onPopupConfirm(setPopup),
      window.electron.onSettingsUpdate(setSettings),
      window.electron.onContentFullscreen(setFullscreen),
      window.electron.onFindOpen(() => setShowFind(true)),
      window.electron.onDownloadsUpdate(setDownloads),
      window.electron.onOpenHistory(() => openPanel('history')),
      window.electron.onOpenDownloads(() => openPanel('downloads')),
    ]

    const onResize = (): void => window.electron.reportResize(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onResize)
    onResize()

    return () => { cleans.forEach(c => c()); window.removeEventListener('resize', onResize) }
  }, [])

  const activeTab = state.tabs.find(t => t.id === state.activeTabId)
  const activeDownloadCount = downloads.filter(d => d.state === 'progressing').length

  function closeFind(): void { setShowFind(false); window.electron.findClose() }

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
            isBookmarked={state.isBookmarked}
            activeDownloadCount={activeDownloadCount}
            onOpenSettings={() => openPanel('settings')}
            onOpenDownloads={() => openPanel('downloads')}
            onOpenBookmarks={() => openPanel('bookmarks')}
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
      {panel === 'settings' && (
        <SettingsModal settings={settings} onChange={setSettings} onClose={closePanel} />
      )}
      {panel === 'bookmarks' && (
        <BookmarksPanel onClose={closePanel} onNavigate={navigate} />
      )}
      {panel === 'history' && (
        <HistoryPanel onClose={closePanel} onNavigate={navigate} />
      )}
      {panel === 'downloads' && (
        <DownloadsPanel active={downloads} onClose={closePanel} />
      )}
    </div>
  )
}
