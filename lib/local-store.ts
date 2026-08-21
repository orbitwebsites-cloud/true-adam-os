import { AIProvider } from './providers'
import { Message } from './types'

const KEYS = {
  settings: 'true-adam:settings',
  history: 'true-adam:history',
} as const

export interface AppSettings {
  activeProvider: AIProvider | null
  apiKeys: Partial<Record<AIProvider, string>>
}

const DEFAULT_SETTINGS: AppSettings = {
  activeProvider: null,
  apiKeys: {},
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  return safeParse(localStorage.getItem(KEYS.settings), DEFAULT_SETTINGS)
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.settings, JSON.stringify(settings))
}

export function loadHistory(): Message[] {
  if (typeof window === 'undefined') return []
  return safeParse(localStorage.getItem(KEYS.history), [] as Message[])
}

export function saveHistory(messages: Message[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.history, JSON.stringify(messages))
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEYS.history)
}
