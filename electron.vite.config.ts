import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: { plugins: [externalizeDepsPlugin()] },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: 'src/preload/index.ts',
          webview: 'src/preload/webview.ts',
        },
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: { plugins: [react(), tailwindcss()] },
})
