export interface Settings {
  blockingMode: 'default' | 'strict'
  autoBlockBlocked: boolean
  blockedDomains: string[]
}

export interface TabInfo {
  id: number
  title: string
  url: string
  favicon?: string
  loading: boolean
  canGoBack: boolean
  canGoForward: boolean
  zoom: number
}

export interface TabsState {
  tabs: TabInfo[]
  activeTabId: number
  adBlockerEnabled: boolean
  isBookmarked: boolean
}

export interface FindResult { activeMatch: number; total: number }

export interface Bookmark { url: string; title: string; favicon?: string; createdAt: number }
export interface HistoryEntry { id: number; url: string; title: string; favicon?: string; visitedAt: number }
export interface StoredDownload { id: number; url: string; filename: string; savePath: string; totalBytes: number; completedAt: number }
export interface ActiveDownload {
  id: number; url: string; filename: string; savePath: string
  totalBytes: number; receivedBytes: number
  state: 'progressing' | 'paused' | 'completed' | 'cancelled' | 'interrupted'
  startedAt: number; completedAt?: number
}

declare global {
  interface Window {
    electron: {
      navigate: (url: string) => void
      goBack: () => void
      goForward: () => void
      reload: () => void
      newTab: (url?: string) => void
      closeTab: (id: number) => void
      switchTab: (id: number) => void
      toggleAdBlock: () => void
      zoomIn: () => void
      zoomOut: () => void
      zoomReset: () => void
      bookmarkToggle: () => void
      bookmarkList: () => Promise<Bookmark[]>
      bookmarkDelete: (url: string) => void
      historyList: (limit?: number, search?: string) => Promise<HistoryEntry[]>
      historyDelete: (id: number) => void
      historyClear: () => void
      downloadCancel: (id: number) => void
      downloadOpen: (path: string) => void
      downloadShowFolder: (path: string) => void
      downloadListStored: () => Promise<StoredDownload[]>
      getState: () => Promise<TabsState>
      getSettings: () => Promise<Settings>
      saveSettings: (s: Settings) => void
      reportResize: (w: number, h: number) => void
      viewHide: () => void
      viewShow: () => void
      popupOpen: (url: string) => void
      popupBlock: (url: string) => void
      popupDismiss: () => void
      findClose: () => void
      findSearch: (text: string, forward: boolean) => void
      findNext: (text: string, forward: boolean) => void
      onTabsUpdate: (cb: (data: TabsState) => void) => () => void
      onDownloadsUpdate: (cb: (data: ActiveDownload[]) => void) => () => void
      onPopupConfirm: (cb: (data: { url: string; from: string }) => void) => () => void
      onFindOpen: (cb: () => void) => () => void
      onFindForceClose: (cb: () => void) => () => void
      onFindResult: (cb: (r: FindResult) => void) => () => void
      onFocusUrlBar: (cb: () => void) => () => void
      onContentFullscreen: (cb: (full: boolean) => void) => () => void
      onSettingsUpdate: (cb: (s: Settings) => void) => () => void
      onOpenHistory: (cb: () => void) => () => void
      onOpenDownloads: (cb: () => void) => () => void
    }
  }
}
