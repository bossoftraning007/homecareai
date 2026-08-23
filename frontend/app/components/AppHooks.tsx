'use client'
import { useGlobalShortcuts } from './useKeyboardShortcuts'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'

export function AppLevelHooks() {
  useGlobalShortcuts()
  return <KeyboardShortcutsHelp />
}
