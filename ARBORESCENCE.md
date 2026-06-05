# Arborescence

```
echo-browser/
├── src/
│   ├── main/
│   │   ├── index.ts          — app principale, tabs, IPC, window
│   │   └── adBlocker.ts      — setup cliqz adblocker
│   ├── preload/
│   │   └── index.ts          — bridge contextBridge
│   ├── renderer/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── TabBar.tsx    — onglets + window controls
│   │       └── Toolbar.tsx   — URL bar, nav, shield toggle
│   └── shared/
│       └── types.ts          — TabInfo, TabsState, Window.electron
├── logs/
├── electron.vite.config.ts
├── tsconfig.json / tsconfig.node.json / tsconfig.web.json
├── package.json
├── start.sh / stop.sh / restart.sh
├── .echoforge.yml
└── STATE.md / TODO.md / ARBORESCENCE.md
```
