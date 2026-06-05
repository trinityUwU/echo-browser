import { useEffect, useState } from 'react'
import { X, Trash2, Globe } from 'lucide-react'
import type { Bookmark } from '../../shared/types'

interface Props { onClose: () => void; onNavigate: (url: string) => void }

export default function BookmarksPanel({ onClose, onNavigate }: Props): JSX.Element {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => { window.electron.bookmarkList().then(setBookmarks) }, [])

  function remove(url: string, e: React.MouseEvent): void {
    e.stopPropagation()
    window.electron.bookmarkDelete(url)
    setBookmarks(b => b.filter(x => x.url !== url))
  }

  const filtered = search
    ? bookmarks.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.url.toLowerCase().includes(search.toLowerCase()))
    : bookmarks

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid #2e2e2e', borderRadius: 16, width: 520, maxWidth: '92vw', maxHeight: '75vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Favoris</span>
          <button onClick={onClose} style={closeBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#e4e4e7' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans les favoris…"
            style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid #2e2e2e', background: '#0a0a0a', color: '#e4e4e7', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#52525b', fontSize: 13 }}>
              {bookmarks.length === 0 ? 'Aucun favori — Ctrl+D pour en ajouter' : 'Aucun résultat'}
            </div>
          )}
          {filtered.map(b => (
            <div key={b.url}
              onClick={() => onNavigate(b.url)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #1a1a1a' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {b.favicon
                ? <img src={b.favicon} width={16} height={16} style={{ borderRadius: 3, flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none' }} />
                : <Globe size={14} style={{ color: '#52525b', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title || b.url}</div>
                <div style={{ fontSize: 11, color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.url}</div>
              </div>
              <button onClick={e => remove(b.url, e)} style={iconBtnStyle}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent' }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const closeBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', color: '#71717a' }
const iconBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: '#52525b', flexShrink: 0 }
