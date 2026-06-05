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
}

export interface FindResult {
  activeMatch: number
  total: number
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
      onPopupConfirm: (cb: (data: { url: string; from: string }) => void) => () => void
      onFindOpen: (cb: () => void) => () => void
      onFindForceClose: (cb: () => void) => () => void
      onFindResult: (cb: (r: FindResult) => void) => () => void
      onFocusUrlBar: (cb: () => void) => () => void
      onContentFullscreen: (cb: (full: boolean) => void) => () => void
      onSettingsUpdate: (cb: (s: Settings) => void) => () => void
    }
  }
}
