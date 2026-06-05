import { X, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import type { Settings } from '../../shared/types'

interface Props {
  settings: Settings
  onChange: (s: Settings) => void
  onClose: () => void
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const panel: React.CSSProperties = {
  background: '#111', border: '1px solid #2e2e2e', borderRadius: 16,
  width: 480, maxWidth: '92vw', maxHeight: '80vh',
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  overflow: 'hidden',
}

export default function SettingsModal({ settings, onChange, onClose }: Props): JSX.Element {
  function update(patch: Partial<Settings>): void {
    const next = { ...settings, ...patch }
    onChange(next)
    window.electron.saveSettings(next)
  }

  function removeBlockedDomain(domain: string): void {
    update({ blockedDomains: settings.blockedDomains.filter(d => d !== domain) })
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1e1e1e' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#f4f4f5' }}>Paramètres</span>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', color: '#71717a' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.color = '#e4e4e7' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Mode de blocage */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Blocage des popups</span>

            <div style={{ display: 'flex', gap: 10 }}>
              {(['default', 'strict'] as const).map(mode => {
                const active = settings.blockingMode === mode
                const Icon = mode === 'default' ? ShieldCheck : ShieldOff
                return (
                  <button key={mode} onClick={() => update({ blockingMode: mode })} style={{
                    flex: 1, padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: active ? '1px solid rgba(99,102,241,0.5)' : '1px solid #2e2e2e',
                    background: active ? 'rgba(99,102,241,0.1)' : '#0a0a0a',
                    display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={15} style={{ color: active ? '#818cf8' : '#71717a' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: active ? '#c7d2fe' : '#a1a1aa' }}>
                        {mode === 'default' ? 'Standard' : 'Strict'}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: '#71717a', textAlign: 'left', lineHeight: 1.5 }}>
                      {mode === 'default'
                        ? 'Demande confirmation pour chaque popup externe'
                        : 'Bloque silencieusement toutes les popups externes'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Auto-block option (mode standard seulement) */}
            {settings.blockingMode === 'default' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 14px', borderRadius: 10, background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                <input type="checkbox" checked={settings.autoBlockBlocked}
                  onChange={e => update({ autoBlockBlocked: e.target.checked })}
                  style={{ marginTop: 2, width: 14, height: 14, accentColor: '#818cf8', cursor: 'pointer', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 13, color: '#e4e4e7' }}>Mémoriser les domaines bloqués manuellement</span>
                  <span style={{ fontSize: 12, color: '#71717a' }}>Les domaines que tu bloques ne demanderont plus de confirmation</span>
                </div>
              </label>
            )}
          </section>

          {/* Liste domaines bloqués */}
          {settings.blockedDomains.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Domaines bloqués ({settings.blockedDomains.length})
                </span>
                <button onClick={() => update({ blockedDomains: [] })}
                  style={{ fontSize: 11, color: '#71717a', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 6 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}>
                  Tout supprimer
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
                {settings.blockedDomains.map(domain => (
                  <div key={domain} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: '#0a0a0a', border: '1px solid #1e1e1e' }}>
                    <span style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'monospace' }}>{domain}</span>
                    <button onClick={() => removeBlockedDomain(domain)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: '#52525b' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
