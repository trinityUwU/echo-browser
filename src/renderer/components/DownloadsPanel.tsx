import { useEffect, useState } from 'react'
import { X, FolderOpen, ExternalLink, XCircle, CheckCircle2, Download, AlertCircle } from 'lucide-react'
import type { ActiveDownload, StoredDownload } from '../../shared/types'

interface Props { active: ActiveDownload[]; onClose: () => void }

function fmtBytes(n: number): string {
  if (n <= 0) return '?'
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

function fmtDate(ts: number): string {
  return new Intl.DateTimeFormat('fr', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ts))
}

function ProgressDl({ dl }: { dl: ActiveDownload }): JSX.Element {
  const pct = dl.totalBytes > 0 ? Math.round((dl.receivedBytes / dl.totalBytes) * 100) : 0
  const isActive = dl.state === 'progressing' || dl.state === 'paused'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 16px', borderBottom: '1px solid #141414' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Download size={13} style={{ color: '#6366f1', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dl.filename}</span>
        {isActive && (
          <button onClick={() => window.electron.downloadCancel(dl.id)} title="Annuler"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, border: 'none', background: 'transparent', borderRadius: 5, cursor: 'pointer', color: '#71717a', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#71717a' }}>
            <XCircle size={14} />
          </button>
        )}
        {dl.state === 'completed' && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => window.electron.downloadOpen(dl.savePath)} title="Ouvrir le fichier"
              style={smallBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')} onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}>
              <ExternalLink size={13} />
            </button>
            <button onClick={() => window.electron.downloadShowFolder(dl.savePath)} title="Afficher dans le dossier"
              style={smallBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')} onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}>
              <FolderOpen size={13} />
            </button>
          </div>
        )}
      </div>
      {isActive && (
        <>
          <div style={{ height: 3, background: '#1e1e1e', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#6366f1', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: '#52525b' }}>
            {pct}% — {fmtBytes(dl.receivedBytes)} / {fmtBytes(dl.totalBytes)}
          </div>
        </>
      )}
      {dl.state === 'completed' && (
        <div style={{ fontSize: 11, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dl.savePath}</div>
      )}
      {(dl.state === 'cancelled' || dl.state === 'interrupted') && (
        <div style={{ fontSize: 11, color: '#f87171' }}>
          {dl.state === 'cancelled' ? 'Annulé' : 'Interrompu'}
        </div>
      )}
    </div>
  )
}

export default function DownloadsPanel({ active, onClose }: Props): JSX.Element {
  const [stored, setStored] = useState<StoredDownload[]>([])

  useEffect(() => { window.electron.downloadListStored().then(setStored) }, [])

  const hasActive = active.length > 0
  const hasStored = stored.length > 0

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid #2e2e2e', borderRadius: 16, width: 480, maxWidth: '92vw', maxHeight: '75vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5' }}>Téléchargements</span>
          <button onClick={onClose} style={closeBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#e4e4e7' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {!hasActive && !hasStored && (
            <div style={{ padding: 40, textAlign: 'center', color: '#52525b', fontSize: 13 }}>Aucun téléchargement</div>
          )}

          {hasActive && (
            <>
              <div style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>En cours</div>
              {active.map(dl => <ProgressDl key={dl.id} dl={dl} />)}
            </>
          )}

          {hasStored && (
            <>
              <div style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Récents</div>
              {stored.map(dl => (
                <div key={dl.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderBottom: '1px solid #141414' }}>
                  <CheckCircle2 size={13} style={{ color: '#34d399', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dl.filename}</div>
                    <div style={{ fontSize: 11, color: '#52525b' }}>{fmtBytes(dl.totalBytes)} · {fmtDate(dl.completedAt)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => window.electron.downloadOpen(dl.savePath)} title="Ouvrir"
                      style={smallBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')} onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}>
                      <ExternalLink size={13} />
                    </button>
                    <button onClick={() => window.electron.downloadShowFolder(dl.savePath)} title="Afficher"
                      style={smallBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')} onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}>
                      <FolderOpen size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const closeBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', color: '#71717a' }
const smallBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: 5, cursor: 'pointer', color: '#71717a', flexShrink: 0 }
