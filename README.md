# echo-browser

Navigateur desktop souverain — Electron + React + bloqueur de pubs natif.

## Stack

| Couche | Technologie |
|--------|-------------|
| Shell | Electron 33 |
| UI | React 18 + TypeScript + Tailwind v4 |
| Ad blocking | @cliqz/adblocker-electron |
| Build | electron-vite 5 + Bun |

## Install

```bash
git clone https://github.com/trinityUwU/echo-browser
cd echo-browser
chmod +x install.sh && ./install.sh
```

Le script installe les dépendances, télécharge le binaire Electron si absent, et build le projet.

## Lancement

```bash
./start.sh       # lance l'app
./stop.sh        # kill le process
./restart.sh     # stop + start
```

Ou directement :
```bash
bun run dev      # mode dev avec DevTools
bun run start    # mode prod
```

## Fonctionnalités

- **Multi-onglets** avec favicons et indicateur de chargement
- **Bloqueur de pubs** intégré (toggle shield dans la toolbar)
- **Blocage popups** cross-domain : modal de confirmation ou blocage silencieux (mode strict)
- **Auto-blocage** : mémorise les domaines bloqués manuellement
- **Fullscreen** HTML5 — masquage automatique de la toolbar
- **Compatibilité Google/YouTube** — Chrome UA + client hints injectés

## Paramètres

Icône engrenage en toolbar :
- **Mode Standard** — modal de confirmation pour chaque popup externe
- **Mode Strict** — blocage silencieux sans demande
- **Mémoriser les bloqués** — plus jamais de modal pour les domaines déjà bloqués

Settings persistés dans `~/.config/echo-browser/settings.json`.

## Architecture

```
src/
├── main/
│   ├── index.ts        # process principal, tabs, IPC, bounds
│   ├── adBlocker.ts    # setup @cliqz/adblocker-electron
│   └── settings.ts     # persistance settings JSON
├── preload/
│   └── index.ts        # bridge IPC contextBridge
├── renderer/
│   ├── App.tsx
│   └── components/
│       ├── TabBar.tsx
│       ├── Toolbar.tsx
│       ├── PopupModal.tsx
│       └── SettingsModal.tsx
└── shared/
    └── types.ts        # types partagés main/renderer
```
