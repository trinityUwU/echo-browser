import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight, RotateCw, Shield, ShieldOff, X, Settings, Star, Download } from 'lucide-react'
import ProgressBar from './ProgressBar'

interface Props {
  url: string
  loading: boolean
  canGoBack: boolean
  canGoForward: boolean
  adBlockerEnabled: boolean
  zoom: number
  isBookmarked: boolean
  activeDownloadCount: number
  onOpenSettings: () => void
  onOpenDownloads: () => void
  onOpenBookmarks: () => void
}

function normalizeUrl(input: string): string {
  const s = input.trim()
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(s) && !s.includes(' ')) return `https://${s}`
  return `https://www.google.com/search?q=${encodeURIComponent(s)}`
}

const btn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, border: 'none', background: 'transparent',
  borderRadius: 10, cursor: 'pointer', color: '#a1a1aa', flexShrink: 0,
  transition: 'background 0.15s, color 0.15s',
}

export default function Toolbar({ url, loading, canGoBack, canGoForward, adBlockerEnabled, zoom, isBookmarked, activeDownloadCount, onOpenSettings, onOpenDownloads, onOpenBookmarks }: Props): JSX.Element {
  const [input, setInput] = useState(url)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!focused) setInput(url) }, [url, focused])

  useEffect(() => {
    const clean = window.electron.onFocusUrlBar(() => { ref.current?.focus(); ref.current?.select() })
    return clean
  }, [])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') { ref.current?.blur(); window.electron.navigate(normalizeUrl(input)) }
    if (e.key === 'Escape') { setInput(url); ref.current?.blur() }
  }

  function hoverOn(e: React.MouseEvent<HTMLButtonElement>): void {
    e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#e4e4e7'
  }
  function hoverOff(e: React.MouseEvent<HTMLButtonElement>, disabled?: boolean): void {
    e.currentTarget.style.background = 'transparent'
    e.currentTarget.style.color = disabled ? 'rgba(161,161,170,0.25)' : '#a1a1aa'
  }

  const zoomPct = Math.round(zoom * 100)
  const showZoom = zoomPct !== 100

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 60, padding: '0 32px', gap: 10, background: '#0f0f0f', borderBottom: '1px solid #1e1e1e' }}>
      {/* Nav buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button disabled={!canGoBack} onClick={() => window.electron.goBack()}
          style={{ ...btn, opacity: canGoBack ? 1 : 0.25, cursor: canGoBack ? 'pointer' : 'default' }}
          onMouseEnter={e => canGoBack && hoverOn(e)} onMouseLeave={e => hoverOff(e, !canGoBack)}>
          <ChevronLeft size={18} />
        </button>
        <button disabled={!canGoForward} onClick={() => window.electron.goForward()}
          style={{ ...btn, opacity: canGoForward ? 1 : 0.25, cursor: canGoForward ? 'pointer' : 'default' }}
          onMouseEnter={e => canGoForward && hoverOn(e)} onMouseLeave={e => hoverOff(e, !canGoForward)}>
          <ChevronRight size={18} />
        </button>
        <button onClick={() => window.electron.reload()} style={btn} onMouseEnter={hoverOn} onMouseLeave={e => hoverOff(e)}>
          {loading ? <X size={18} /> : <RotateCw size={18} />}
        </button>
      </div>

      {/* URL bar */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input ref={ref} value={input} onChange={e => setInput(e.target.value)}
          onFocus={() => { setFocused(true); ref.current?.select() }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          style={{
            width: '100%', height: 38, padding: showZoom ? '0 60px 0 16px' : '0 16px',
            borderRadius: 20, background: '#1a1a1a',
            border: focused ? '1px solid #444' : '1px solid #2e2e2e',
            color: '#e4e4e7', fontSize: 13, outline: 'none', transition: 'border-color 0.15s',
          }}
          placeholder="Rechercher ou saisir une URL…"
          spellCheck={false}
        />
        {showZoom && (
          <button onClick={() => window.electron.zoomReset()} title="Réinitialiser le zoom"
            style={{ position: 'absolute', right: 10, padding: '2px 8px', borderRadius: 6, border: '1px solid #2e2e2e', background: 'transparent', color: '#71717a', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#a1a1aa' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}>
            {zoomPct}%
          </button>
        )}
      </div>

      {/* Star (bookmark) */}
      <button onClick={() => { window.electron.bookmarkToggle() }} title={isBookmarked ? 'Retirer des favoris (Ctrl+D)' : 'Ajouter aux favoris (Ctrl+D)'}
        style={{ ...btn, color: isBookmarked ? '#fbbf24' : '#52525b' }}
        onMouseEnter={e => { e.currentTarget.style.background = isBookmarked ? 'rgba(251,191,36,0.1)' : '#1e1e1e'; e.currentTarget.style.color = '#fbbf24' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isBookmarked ? '#fbbf24' : '#52525b' }}>
        <Star size={17} fill={isBookmarked ? '#fbbf24' : 'none'} />
      </button>

      {/* Shield (adblock) */}
      <button onClick={() => window.electron.toggleAdBlock()} title={adBlockerEnabled ? 'Blocage pub actif' : 'Blocage pub désactivé'}
        style={{ ...btn, color: adBlockerEnabled ? '#34d399' : '#52525b' }}
        onMouseEnter={e => { e.currentTarget.style.background = adBlockerEnabled ? 'rgba(6,78,59,0.4)' : '#1e1e1e'; e.currentTarget.style.color = adBlockerEnabled ? '#34d399' : '#a1a1aa' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = adBlockerEnabled ? '#34d399' : '#52525b' }}>
        {adBlockerEnabled ? <Shield size={18} /> : <ShieldOff size={18} />}
      </button>

      {/* Downloads */}
      <div style={{ position: 'relative' }}>
        <button onClick={onOpenDownloads} title="Téléchargements (Ctrl+J)" style={{ ...btn, color: '#52525b' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#a1a1aa' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#52525b' }}>
          <Download size={17} />
        </button>
        {activeDownloadCount > 0 && (
          <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#6366f1', border: '2px solid #0f0f0f', pointerEvents: 'none' }} />
        )}
      </div>

      {/* Settings */}
      <button onClick={onOpenSettings} title="Paramètres" style={{ ...btn, color: '#52525b' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#a1a1aa' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#52525b' }}>
        <Settings size={18} />
      </button>

      <ProgressBar loading={loading} />
    </div>
  )
}
