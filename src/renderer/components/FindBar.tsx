import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronUp, ChevronDown, X } from 'lucide-react'
import type { FindResult } from '../../shared/types'

interface Props { onClose: () => void }

const btn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, border: 'none', background: 'transparent',
  borderRadius: 6, cursor: 'pointer', color: '#71717a',
  transition: 'background 0.12s, color 0.12s', flexShrink: 0,
}

export default function FindBar({ onClose }: Props): JSX.Element {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<FindResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const clean = window.electron.onFindResult(setResult)
    const cleanForce = window.electron.onFindForceClose(onClose)
    return () => { clean(); cleanForce() }
  }, [onClose])

  useEffect(() => {
    if (query) window.electron.findSearch(query, true)
    else setResult(null)
  }, [query])

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') next(true)
    if (e.key === 'Escape') close()
  }

  function next(forward: boolean): void {
    if (!query) return
    window.electron.findNext(query, forward)
  }

  function close(): void {
    window.electron.findClose()
    onClose()
  }

  const noMatch = result !== null && result.total === 0

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      height: 48, padding: '0 20px',
      background: '#111', borderBottom: '1px solid #1e1e1e',
      flexShrink: 0,
    }}>
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Rechercher dans la page..."
        spellCheck={false}
        style={{
          width: 240, height: 32, padding: '0 12px',
          borderRadius: 8, outline: 'none',
          background: noMatch ? 'rgba(239,68,68,0.12)' : '#1a1a1a',
          border: noMatch ? '1px solid rgba(239,68,68,0.4)' : '1px solid #2e2e2e',
          color: noMatch ? '#f87171' : '#e4e4e7',
          fontSize: 13, transition: 'border-color 0.15s, background 0.15s',
        }}
      />

      {result !== null && (
        <span style={{ fontSize: 12, color: '#71717a', whiteSpace: 'nowrap', minWidth: 60 }}>
          {result.total === 0 ? 'Aucun résultat' : `${result.activeMatch} / ${result.total}`}
        </span>
      )}

      <button style={btn} onClick={() => next(false)}
        title="Précédent (Shift+Entrée)"
        onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#a1a1aa' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}>
        <ChevronUp size={16} />
      </button>
      <button style={btn} onClick={() => next(true)}
        title="Suivant (Entrée)"
        onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#a1a1aa' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}>
        <ChevronDown size={16} />
      </button>
      <button style={{ ...btn, marginLeft: 4 }} onClick={close}
        title="Fermer (Échap)"
        onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#e4e4e7' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}>
        <X size={15} />
      </button>
    </div>
  )
}
