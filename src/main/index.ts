import { app, BrowserWindow, ipcMain, WebContentsView, session } from 'electron'
import { join } from 'path'
import { createAdBlocker } from './adBlocker'
import { loadSettings, saveSettings } from './settings'
import type { ElectronBlocker } from '@cliqz/adblocker-electron'
import type { TabInfo } from '../shared/types'
import type { Settings } from './settings'

const HEADER_HEIGHT = 116
const CHROME_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'

let win: BrowserWindow
let blocker: ElectronBlocker
let adBlockerEnabled = true
let activeTabId = 0
let nextId = 1
let settings: Settings
let contentFullscreen = false

interface Tab extends TabInfo { view: WebContentsView }
const tabs: Tab[] = []

function getActive(): Tab | undefined {
  return tabs.find(t => t.id === activeTabId)
}

function sameDomain(a: string, b: string): boolean {
  try { return new URL(a).hostname === new URL(b).hostname } catch { return false }
}

function getHostname(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}

function pushState(): void {
  win.webContents.send('tabs-update', {
    tabs: tabs.map(({ id, title, url, favicon, loading, canGoBack, canGoForward }) =>
      ({ id, title, url, favicon, loading, canGoBack, canGoForward })),
    activeTabId,
    adBlockerEnabled,
  })
}

function pushSettings(): void {
  win.webContents.send('settings-update', settings)
}

function hideActiveView(): void {
  const t = tabs.find(tab => tab.id === activeTabId)
  if (t) t.view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
}

function updateBounds(w?: number, h?: number): void {
  const [width, height] = w && h ? [w, h] : win.getContentSize()
  const y = contentFullscreen ? 0 : HEADER_HEIGHT
  const ch = contentFullscreen ? height : height - HEADER_HEIGHT
  for (const t of tabs) {
    t.view.setBounds(t.id === activeTabId
      ? { x: 0, y, width, height: ch }
      : { x: 0, y: 0, width: 0, height: 0 })
  }
}

function createTab(url = 'https://google.com'): Tab {
  const view = new WebContentsView({ webPreferences: { contextIsolation: true, nodeIntegration: false } })
  view.webContents.setUserAgent(CHROME_UA)

  const tab: Tab = { id: nextId++, view, title: 'New Tab', url, loading: true, canGoBack: false, canGoForward: false }
  tabs.push(tab)
  win.contentView.addChildView(view)

  view.webContents.setWindowOpenHandler(({ url: u, disposition }) => {
    if (!u || u === 'about:blank') return { action: 'deny' }
    if (sameDomain(u, tab.url)) {
      const t = createTab(u)
      if (disposition !== 'background-tab') switchTab(t.id)
      return { action: 'deny' }
    }
    const hostname = getHostname(u)
    if (settings.blockedDomains.includes(hostname) || settings.blockingMode === 'strict') {
      return { action: 'deny' }
    }
    hideActiveView()
    win.webContents.send('popup-confirm', { url: u, from: tab.url })
    return { action: 'deny' }
  })

  view.webContents.on('page-title-updated', (_, title) => { tab.title = title; pushState() })
  view.webContents.on('did-navigate', (_, u) => {
    tab.url = u
    tab.canGoBack = view.webContents.navigationHistory.canGoBack()
    tab.canGoForward = view.webContents.navigationHistory.canGoForward()
    pushState()
  })
  view.webContents.on('did-navigate-in-page', (_, u) => {
    tab.url = u
    tab.canGoBack = view.webContents.navigationHistory.canGoBack()
    tab.canGoForward = view.webContents.navigationHistory.canGoForward()
    pushState()
  })
  view.webContents.on('page-favicon-updated', (_, favs) => { tab.favicon = favs[0]; pushState() })
  view.webContents.on('did-start-loading', () => { tab.loading = true; pushState() })
  view.webContents.on('did-stop-loading', () => { tab.loading = false; pushState() })
  view.webContents.on('enter-html-full-screen', () => {
    contentFullscreen = true
    updateBounds()
    win.webContents.send('content-fullscreen', true)
  })
  view.webContents.on('leave-html-full-screen', () => {
    contentFullscreen = false
    updateBounds()
    win.webContents.send('content-fullscreen', false)
  })

  view.webContents.loadURL(url)
  return tab
}

function switchTab(id: number): void {
  if (contentFullscreen) {
    contentFullscreen = false
    win.webContents.send('content-fullscreen', false)
  }
  activeTabId = id
  updateBounds()
  pushState()
}

function closeTab(id: number): void {
  const idx = tabs.findIndex(t => t.id === id)
  if (idx === -1) return
  const [tab] = tabs.splice(idx, 1)
  win.contentView.removeChildView(tab.view)
  tab.view.webContents.close()
  if (tabs.length === 0) { const t = createTab(); switchTab(t.id) }
  else if (activeTabId === id) { switchTab(tabs[Math.max(0, idx - 1)].id) }
  pushState()
}

function setupIPC(): void {
  ipcMain.handle('get-state', () => ({
    tabs: tabs.map(({ id, title, url, favicon, loading, canGoBack, canGoForward }) =>
      ({ id, title, url, favicon, loading, canGoBack, canGoForward })),
    activeTabId,
    adBlockerEnabled,
  }))
  ipcMain.handle('get-settings', () => settings)
  ipcMain.on('save-settings', (_, s: Settings) => {
    settings = s
    saveSettings(s)
    pushSettings()
  })
  ipcMain.on('renderer-resize', (_, w: number, h: number) => updateBounds(w, h))
  ipcMain.on('navigate', (_, url: string) => getActive()?.view.webContents.loadURL(url))
  ipcMain.on('go-back', () => getActive()?.view.webContents.navigationHistory.goBack())
  ipcMain.on('go-forward', () => getActive()?.view.webContents.navigationHistory.goForward())
  ipcMain.on('reload', () => getActive()?.view.webContents.reload())
  ipcMain.on('new-tab', (_, url?: string) => { const t = createTab(url); switchTab(t.id) })
  ipcMain.on('close-tab', (_, id: number) => closeTab(id))
  ipcMain.on('switch-tab', (_, id: number) => switchTab(id))
  ipcMain.on('view-hide', () => hideActiveView())
  ipcMain.on('view-show', () => updateBounds())
  ipcMain.on('popup-open', (_, url: string) => { updateBounds(); const t = createTab(url); switchTab(t.id) })
  ipcMain.on('popup-block', (_, url: string) => {
    updateBounds()
    if (settings.autoBlockBlocked) {
      const hostname = getHostname(url)
      if (!settings.blockedDomains.includes(hostname)) {
        settings.blockedDomains = [...settings.blockedDomains, hostname]
        saveSettings(settings)
        pushSettings()
      }
    }
  })
  ipcMain.on('popup-dismiss', () => updateBounds())
  ipcMain.on('toggle-adblock', () => {
    adBlockerEnabled = !adBlockerEnabled
    adBlockerEnabled
      ? blocker.enableBlockingInSession(session.defaultSession)
      : blocker.disableBlockingInSession(session.defaultSession)
    pushState()
  })
}

async function createWindow(): Promise<void> {
  settings = loadSettings()

  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 800, minHeight: 600,
    frame: false,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  blocker = await createAdBlocker(session.defaultSession)

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const h = { ...details.requestHeaders }
    h['User-Agent'] = CHROME_UA
    h['sec-ch-ua'] = '"Not A(Brand";v="8", "Chromium";v="133", "Google Chrome";v="133"'
    h['sec-ch-ua-mobile'] = '?0'
    h['sec-ch-ua-platform'] = '"Linux"'
    callback({ requestHeaders: h })
  })

  setupIPC()

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.webContents.on('did-finish-load', () => {
    const t = createTab(); switchTab(t.id)
  })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
