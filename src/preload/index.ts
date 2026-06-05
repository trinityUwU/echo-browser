import { contextBridge, ipcRenderer } from 'electron'
import type { TabsState, Settings } from '../shared/types'

contextBridge.exposeInMainWorld('electron', {
  navigate: (url: string) => ipcRenderer.send('navigate', url),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  reload: () => ipcRenderer.send('reload'),
  newTab: (url?: string) => ipcRenderer.send('new-tab', url),
  closeTab: (id: number) => ipcRenderer.send('close-tab', id),
  switchTab: (id: number) => ipcRenderer.send('switch-tab', id),
  toggleAdBlock: () => ipcRenderer.send('toggle-adblock'),
  reportResize: (w: number, h: number) => ipcRenderer.send('renderer-resize', w, h),
  viewHide: () => ipcRenderer.send('view-hide'),
  viewShow: () => ipcRenderer.send('view-show'),
  popupOpen: (url: string) => ipcRenderer.send('popup-open', url),
  popupBlock: (url: string) => ipcRenderer.send('popup-block', url),
  popupDismiss: () => ipcRenderer.send('popup-dismiss'),
  getState: (): Promise<TabsState> => ipcRenderer.invoke('get-state'),
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
  saveSettings: (s: Settings) => ipcRenderer.send('save-settings', s),
  onTabsUpdate: (cb: (data: TabsState) => void) => {
    const h = (_: unknown, d: TabsState) => cb(d)
    ipcRenderer.on('tabs-update', h)
    return () => ipcRenderer.removeListener('tabs-update', h)
  },
  onPopupConfirm: (cb: (data: { url: string; from: string }) => void) => {
    const h = (_: unknown, d: { url: string; from: string }) => cb(d)
    ipcRenderer.on('popup-confirm', h)
    return () => ipcRenderer.removeListener('popup-confirm', h)
  },
  onContentFullscreen: (cb: (full: boolean) => void) => {
    const h = (_: unknown, v: boolean) => cb(v)
    ipcRenderer.on('content-fullscreen', h)
    return () => ipcRenderer.removeListener('content-fullscreen', h)
  },
  onSettingsUpdate: (cb: (s: Settings) => void) => {
    const h = (_: unknown, s: Settings) => cb(s)
    ipcRenderer.on('settings-update', h)
    return () => ipcRenderer.removeListener('settings-update', h)
  },
})
