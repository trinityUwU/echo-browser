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
}

export interface TabsState {
  tabs: TabInfo[]
  activeTabId: number
  adBlockerEnabled: boolean
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
      minimize: () => void
      maximize: () => void
      closeWindow: () => void
      getState: () => Promise<TabsState>
      reportResize: (w: number, h: number) => void
      viewHide: () => void
      viewShow: () => void
      popupOpen: (url: string) => void
      popupBlock: (url: string) => void
      popupDismiss: () => void
      onPopupConfirm: (cb: (data: { url: string; from: string }) => void) => () => void
      getSettings: () => Promise<Settings>
      saveSettings: (s: Settings) => void
      onContentFullscreen: (cb: (full: boolean) => void) => () => void
      onSettingsUpdate: (cb: (s: Settings) => void) => () => void
      onTabsUpdate: (cb: (data: TabsState) => void) => () => void
    }
  }
}
