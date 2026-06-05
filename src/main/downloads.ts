import { app, shell } from 'electron'
import { join, extname, basename } from 'path'
import { existsSync } from 'fs'
import type { Session, BrowserWindow, DownloadItem as ElectronDownloadItem } from 'electron'
import { addStoredDownload } from './store'

export interface ActiveDownload {
  id: number
  url: string
  filename: string
  savePath: string
  totalBytes: number
  receivedBytes: number
  state: 'progressing' | 'paused' | 'completed' | 'cancelled' | 'interrupted'
  startedAt: number
  completedAt?: number
}

let nextId = 1
const active = new Map<number, ActiveDownload & { _item: ElectronDownloadItem }>()

function uniquePath(filename: string): string {
  const dir = app.getPath('downloads')
  const ext = extname(filename)
  const base = basename(filename, ext)
  let p = join(dir, filename)
  let i = 1
  while (existsSync(p)) p = join(dir, `${base} (${i++})${ext}`)
  return p
}

function serialize({ _item, ...rest }: ActiveDownload & { _item: ElectronDownloadItem }): ActiveDownload {
  return rest
}

function push(win: BrowserWindow): void {
  win.webContents.send('downloads-update', [...active.values()].map(serialize))
}

export function getActiveDownloads(): ActiveDownload[] {
  return [...active.values()].map(serialize)
}

export function cancelDownload(id: number): void { active.get(id)?._item.cancel() }
export function openDownload(savePath: string): void { shell.openPath(savePath) }
export function showDownloadInFolder(savePath: string): void { shell.showItemInFolder(savePath) }

export function setupDownloads(sess: Session, win: BrowserWindow): void {
  sess.on('will-download', (_, item) => {
    const id = nextId++
    const savePath = uniquePath(item.getFilename())
    item.setSavePath(savePath)

    const dl: ActiveDownload & { _item: ElectronDownloadItem } = {
      id, _item: item,
      url: item.getURL(),
      filename: item.getFilename(),
      savePath,
      totalBytes: item.getTotalBytes(),
      receivedBytes: 0,
      state: 'progressing',
      startedAt: Date.now(),
    }
    active.set(id, dl)
    push(win)

    item.on('updated', (_, state) => {
      dl.state = state === 'progressing' ? 'progressing' : 'paused'
      dl.receivedBytes = item.getReceivedBytes()
      dl.totalBytes = item.getTotalBytes()
      push(win)
    })

    item.once('done', (_, state) => {
      dl.state = state as ActiveDownload['state']
      dl.receivedBytes = item.getReceivedBytes()
      dl.completedAt = Date.now()
      push(win)
      if (state === 'completed') {
        addStoredDownload({ id, url: dl.url, filename: dl.filename, savePath: dl.savePath, totalBytes: dl.totalBytes, completedAt: dl.completedAt! })
      }
      setTimeout(() => { active.delete(id); push(win) }, 30000)
    })
  })
}
