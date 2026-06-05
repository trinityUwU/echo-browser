# echo-browser — State

**Status**: MVP stable  
**Stack**: Electron 33 · React 18 · TypeScript · Tailwind v4 · @cliqz/adblocker-electron 1.34

## Fonctionnel
- Multi-onglets (TabBar + Toolbar)
- Navigation (back/forward/reload/URL bar)
- Bloqueur de pubs intégré (toggle shield)
- Blocage popups cross-domain avec modal de confirmation
- Mode strict (blocage silencieux) / mode standard (modal)
- Auto-blocage des domaines bloqués manuellement
- Settings panel (mode, auto-block, liste domaines bloqués)
- Fullscreen HTML5 — masquage automatique du header
- Chrome UA + sec-ch-ua headers (Google/YouTube login OK)
- Persistance settings dans userData/settings.json

## Architecture
- `src/main/index.ts` — process principal, tabs, IPC, bounds
- `src/main/adBlocker.ts` — setup @cliqz/adblocker-electron
- `src/main/settings.ts` — persistance settings JSON
- `src/preload/index.ts` — bridge IPC contextBridge
- `src/renderer/App.tsx` — root React, état global
- `src/renderer/components/TabBar.tsx` — onglets
- `src/renderer/components/Toolbar.tsx` — URL bar, nav, shield, settings
- `src/renderer/components/PopupModal.tsx` — confirmation popup cross-domain
- `src/renderer/components/SettingsModal.tsx` — panel paramètres
- `src/shared/types.ts` — types partagés main/renderer

## HEADER_HEIGHT = 116px
56px (TabBar) + 60px (Toolbar) — doit rester en sync dans index.ts.

## Ports
Aucun port réseau. App desktop Electron autonome.
