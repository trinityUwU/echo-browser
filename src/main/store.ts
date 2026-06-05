import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

export interface Bookmark { url: string; title: string; favicon?: string; createdAt: number }
export interface HistoryEntry { id: number; url: string; title: string; favicon?: string; visitedAt: number }
export interface StoredDownload { id: number; url: string; filename: string; savePath: string; totalBytes: number; completedAt: number }

const DIR = app.getPath('userData')

function read<T>(file: string, fallback: T): T {
  const p = join(DIR, file)
  try { if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf-8')) as T } catch { /* */ }
  return fallback
}
function write(file: string, data: unknown): void {
  writeFileSync(join(DIR, file), JSON.stringify(data))
}

// ── Bookmarks ────────────────────────────────────────────────────────────────
let bookmarks: Bookmark[] = read('bookmarks.json', [])

export function getBookmarks(): Bookmark[] { return bookmarks }
export function isBookmarked(url: string): boolean { return bookmarks.some(b => b.url === url) }
export function toggleBookmark(entry: Omit<Bookmark, 'createdAt'>): boolean {
  const idx = bookmarks.findIndex(b => b.url === entry.url)
  if (idx >= 0) { bookmarks.splice(idx, 1); write('bookmarks.json', bookmarks); return false }
  bookmarks.unshift({ ...entry, createdAt: Date.now() })
  write('bookmarks.json', bookmarks)
  return true
}
export function deleteBookmark(url: string): void {
  bookmarks = bookmarks.filter(b => b.url !== url)
  write('bookmarks.json', bookmarks)
}

// ── History ───────────────────────────────────────────────────────────────────
const HISTORY_MAX = 2000
let history: HistoryEntry[] = read('history.json', [])
let historyId = history.reduce((m, e) => Math.max(m, e.id), 0) + 1

export function getHistory(limit = 200, search?: string): HistoryEntry[] {
  let h = history
  if (search) {
    const q = search.toLowerCase()
    h = h.filter(e => e.url.toLowerCase().includes(q) || e.title.toLowerCase().includes(q))
  }
  return h.slice(0, limit)
}
export function addHistory(entry: Omit<HistoryEntry, 'id' | 'visitedAt'>): void {
  if (!entry.url || entry.url.startsWith('about:') || entry.url.startsWith('devtools:')) return
  history = history.filter(h => h.url !== entry.url)
  history.unshift({ ...entry, id: historyId++, visitedAt: Date.now() })
  if (history.length > HISTORY_MAX) history = history.slice(0, HISTORY_MAX)
  write('history.json', history)
}
export function deleteHistory(id: number): void {
  history = history.filter(h => h.id !== id)
  write('history.json', history)
}
export function clearHistory(): void { history = []; write('history.json', history) }

// ── Downloads (persisted) ─────────────────────────────────────────────────────
let storedDownloads: StoredDownload[] = read('downloads.json', [])

export function getStoredDownloads(): StoredDownload[] { return storedDownloads }
export function addStoredDownload(d: StoredDownload): void {
  storedDownloads.unshift(d)
  if (storedDownloads.length > 100) storedDownloads = storedDownloads.slice(0, 100)
  write('downloads.json', storedDownloads)
}
