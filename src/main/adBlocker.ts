import { ElectronBlocker } from '@cliqz/adblocker-electron'
import type { Session } from 'electron'

export async function createAdBlocker(sess: Session): Promise<ElectronBlocker> {
  const blocker = await ElectronBlocker.fromPrebuiltAdsOnly(fetch)
  blocker.enableBlockingInSession(sess)
  return blocker
}
