import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

export interface Settings {
  blockingMode: 'default' | 'strict'
  autoBlockBlocked: boolean
  blockedDomains: string[]
}

const DEFAULTS: Settings = { blockingMode: 'default', autoBlockBlocked: false, blockedDomains: [] }
const PATH = join(app.getPath('userData'), 'settings.json')

export function loadSettings(): Settings {
  try {
    if (existsSync(PATH)) return { ...DEFAULTS, ...JSON.parse(readFileSync(PATH, 'utf-8')) }
  } catch { /* use defaults */ }
  return { ...DEFAULTS }
}

export function saveSettings(s: Settings): void {
  writeFileSync(PATH, JSON.stringify(s, null, 2))
}
