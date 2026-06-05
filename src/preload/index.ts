import { contextBridge, ipcRenderer } from 'electron'
import type { TabsState, Settings, FindResult, Bookmark, HistoryEntry, StoredDownload, ActiveDownload } from '../shared/types'

function on<T>(ch: string, cb: (d: T) => void): () => void {
  const h = (_: unknown, d: T) => cb(d)
  ipcRenderer.on(ch, h)
  return () => ipcRenderer.removeListener(ch, h)
}
function onVoid(ch: string, cb: () => void): () => void {
  const h = () => cb()
  ipcRenderer.on(ch, h)
  return () => ipcRenderer.removeListener(ch, h)
}

contextBridge.exposeInMainWorld('electron', {
  navigate: (url: string) => ipcRenderer.send('navigate', url),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  reload: () => ipcRenderer.send('reload'),
  newTab: (url?: string) => ipcRenderer.send('new-tab', url),
  closeTab: (id: number) => ipcRenderer.send('close-tab', id),
  switchTab: (id: number) => ipcRenderer.send('switch-tab', id),
  toggleAdBlock: () => ipcRenderer.send('toggle-adblock'),
  zoomIn: () => ipcRenderer.send('zoom-in'),
  zoomOut: () => ipcRenderer.send('zoom-out'),
  zoomReset: () => ipcRenderer.send('zoom-reset'),
  reportResize: (w: number, h: number) => ipcRenderer.send('renderer-resize', w, h),
  viewHide: () => ipcRenderer.send('view-hide'),
  viewShow: () => ipcRenderer.send('view-show'),
  popupOpen: (url: string) => ipcRenderer.send('popup-open', url),
  popupBlock: (url: string) => ipcRenderer.send('popup-block', url),
  popupDismiss: () => ipcRenderer.send('popup-dismiss'),
  findClose: () => ipcRenderer.send('find-close'),
  findSearch: (text: string, forward: boolean) => ipcRenderer.send('find-search', { text, forward }),
  findNext: (text: string, forward: boolean) => ipcRenderer.send('find-next', { text, forward }),
  bookmarkToggle: () => ipcRenderer.send('bookmark-toggle'),
  bookmarkList: (): Promise<Bookmark[]> => ipcRenderer.invoke('bookmark-list'),
  bookmarkDelete: (url: string) => ipcRenderer.send('bookmark-delete', url),
  historyList: (limit?: number, search?: string): Promise<HistoryEntry[]> => ipcRenderer.invoke('history-list', limit, search),
  historyDelete: (id: number) => ipcRenderer.send('history-delete', id),
  historyClear: () => ipcRenderer.send('history-clear'),
  downloadCancel: (id: number) => ipcRenderer.send('download-cancel', id),
  downloadOpen: (path: string) => ipcRenderer.send('download-open', path),
  downloadShowFolder: (path: string) => ipcRenderer.send('download-show-folder', path),
  downloadListStored: (): Promise<StoredDownload[]> => ipcRenderer.invoke('download-list-stored'),
  getState: (): Promise<TabsState> => ipcRenderer.invoke('get-state'),
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
  saveSettings: (s: Settings) => ipcRenderer.send('save-settings', s),
  onTabsUpdate: (cb: (d: TabsState) => void) => on('tabs-update', cb),
  onDownloadsUpdate: (cb: (d: ActiveDownload[]) => void) => on('downloads-update', cb),
  onPopupConfirm: (cb: (d: { url: string; from: string }) => void) => on('popup-confirm', cb),
  onFindOpen: (cb: () => void) => onVoid('find-open', cb),
  onFindForceClose: (cb: () => void) => onVoid('find-force-close', cb),
  onFindResult: (cb: (r: FindResult) => void) => on('find-result', cb),
  onFocusUrlBar: (cb: () => void) => onVoid('focus-url-bar', cb),
  onContentFullscreen: (cb: (v: boolean) => void) => on('content-fullscreen', cb),
  onSettingsUpdate: (cb: (s: Settings) => void) => on('settings-update', cb),
  onOpenHistory: (cb: () => void) => onVoid('open-history', cb),
  onOpenDownloads: (cb: () => void) => onVoid('open-downloads', cb),
})
