import { useEffect, useState, useRef } from 'react'
import { X, Trash2, Globe } from 'lucide-react'
import type { HistoryEntry } from '../../shared/types'

interface Props { onClose: () => void; onNavigate: (url: string) => void }

function groupByDate(entries: HistoryEntry[]): { label: string; items: HistoryEntry[] }[] {
  const now = Date.now()
  const DAY = 86400000
  const today = new Date().setHours(0, 0, 0, 0)
  const yesterday = today - DAY
  const weekAgo = today - 6 * DAY

  const groups: Record<string, HistoryEntry[]> = { 'Aujourd\'hui': [], 'Hier': [], 'Cette semaine': [], 'Plus ancien': [] }
  for (const e of entries) {
    if (e.visitedAt >= today) groups['Aujourd\'hui'].push(e)
    else if (e.visitedAt >= yesterday) groups['Hier'].push(e)
    else if (e.visitedAt >= weekAgo) groups['Cette semaine'].push(e)
    else groups['Plus ancien'].push(e)
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0).map(([label, items]) => ({ label, items }))
}

function fmtTime(ts: number): string {
  return new Intl.DateTimeFormat('fr', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

export default function HistoryPanel({ onClose, onNavigate }: Props): JSX.Element {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [search, setSearch] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  function load(q?: string): void {
    window.electron.historyList(300, q || undefined).then(setEntries)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(search), 200)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  function remove(id: number, e: React.MouseEvent): void {
    e.stopPropagation()
    window.electron.historyDelete(id)
    setEntries(prev => prev.filter(h => h.id !== id))
  }

  function clearAll(): void {
    window.electron.historyClear()
    setEntries([])
  }

  const groups = search ? [{ label: 'Résultats', items: entries }] : groupByDate(entries)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid #2e2e2e', borderRadius: 16, width: 560, maxWidth: '92vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Historique</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {entries.length > 0 && (
              <button onClick={clearAll} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(248,113,113,0.3)', background: 'transparent', color: '#f87171', fontSize: 12, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Tout effacer
              </button>
            )}
            <button onClick={onClose} style={closeBtnStyle}
              onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#e4e4e7' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans l'historique…"
            style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid #2e2e2e', background: '#0a0a0a', color: '#e4e4e7', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {entries.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#52525b', fontSize: 13 }}>Aucun résultat</div>
          )}
          {groups.map(({ label, items }) => (
            <div key={label}>
              <div style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              {items.map(h => (
                <div key={h.id} onClick={() => onNavigate(h.url)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', cursor: 'pointer', borderBottom: '1px solid #141414' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  {h.favicon
                    ? <img src={h.favicon} width={14} height={14} style={{ borderRadius: 3, flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none' }} />
                    : <Globe size={13} style={{ color: '#52525b', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title || h.url}</div>
                    <div style={{ fontSize: 11, color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.url}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#52525b', flexShrink: 0 }}>{fmtTime(h.visitedAt)}</span>
                  <button onClick={e => remove(h.id, e)} style={iconBtnStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const closeBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', color: '#71717a' }
const iconBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: '#52525b', flexShrink: 0 }
