import { ExternalLink, ShieldAlert } from 'lucide-react'

interface Props {
  url: string
  from: string
  onConfirm: () => void
  onDeny: () => void
}

export default function PopupModal({ url, from, onConfirm, onDeny }: Props): JSX.Element {
  let hostname = url
  try { hostname = new URL(url).hostname } catch { /* keep raw */ }

  let fromHost = from
  try { fromHost = new URL(from).hostname } catch { /* keep raw */ }

  return (
    <div
      onClick={onDeny}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111', border: '1px solid #2e2e2e', borderRadius: 16,
          padding: '28px 32px', maxWidth: 480, width: '90%',
          display: 'flex', flexDirection: 'column', gap: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#eab308',
          }}>
            <ShieldAlert size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#f4f4f5' }}>
              Ouverture vers un domaine externe
            </span>
            <span style={{ fontSize: 13, color: '#71717a' }}>
              <span style={{ color: '#a1a1aa' }}>{fromHost}</span> veut ouvrir une nouvelle fenêtre
            </span>
          </div>
        </div>

        <div style={{
          background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 10,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <ExternalLink size={14} style={{ color: '#71717a', flexShrink: 0 }} />
          <span style={{
            fontSize: 13, color: '#a1a1aa', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {url}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onDeny}
            style={{
              padding: '8px 20px', borderRadius: 10, border: '1px solid #2e2e2e',
              background: 'transparent', color: '#a1a1aa', fontSize: 13,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Bloquer
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.4)',
              background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: 13,
              cursor: 'pointer', fontWeight: 500, transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}
          >
            Ouvrir dans un onglet
          </button>
        </div>
      </div>
    </div>
  )
}
