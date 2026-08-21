import { isTauri } from './local-store'

const WEBSITE_SHORTCUTS: Record<string, string> = {
  'google docs': 'https://docs.google.com',
  docs: 'https://docs.google.com',
  youtube: 'https://www.youtube.com',
  google: 'https://www.google.com',
  github: 'https://www.github.com',
  reddit: 'https://www.reddit.com',
  chatgpt: 'https://chatgpt.com',
  twitter: 'https://www.twitter.com',
  x: 'https://www.x.com',
  netflix: 'https://www.netflix.com',
  twitch: 'https://www.twitch.tv',
  spotify: 'https://open.spotify.com',
  gmail: 'https://mail.google.com',
  wikipedia: 'https://www.wikipedia.org',
  britannica: 'https://www.britannica.com',
  amazon: 'https://www.amazon.com',
  stackoverflow: 'https://stackoverflow.com',
  instagram: 'https://www.instagram.com',
  facebook: 'https://www.facebook.com',
  linkedin: 'https://www.linkedin.com',
  tiktok: 'https://www.tiktok.com',
  discord: 'https://discord.com/app',
  claude: 'https://claude.ai',
  duckduckgo: 'https://duckduckgo.com',
  whatsapp: 'https://web.whatsapp.com',
}

// Abbreviations/aliases -> canonical key in WEBSITE_SHORTCUTS.
const WEBSITE_ALIASES: Record<string, string> = {
  gpt: 'chatgpt',
  chat: 'chatgpt',
  yt: 'youtube',
  ig: 'instagram',
  insta: 'instagram',
  fb: 'facebook',
  li: 'linkedin',
  ddg: 'duckduckgo',
  gh: 'github',
  so: 'stackoverflow',
  wiki: 'wikipedia',
  amzn: 'amazon',
  nflx: 'netflix',
  wa: 'whatsapp',
  gdocs: 'google docs',
  twt: 'twitter',
}

// Local desktop apps the Rust side (src-tauri/src/commands.rs) knows how to
// launch. Keep this list in sync with that match arm.
const LOCAL_APP_SHORTCUTS = [
  'notepad',
  'calculator',
  'calc',
  'explorer',
  'files',
  'file explorer',
  'paint',
  'terminal',
  'cmd',
  'command prompt',
  'task manager',
  'settings',
  'firefox',
  'ff',
  'chrome',
  'edge',
  'spotify',
  'discord',
  'slack',
  'vscode',
  'vs code',
  'code',
  'word',
  'excel',
  'powerpoint',
  'steam',
  'whatsapp',
  'telegram',
  'zoom',
]

const LOCAL_APP_ALIASES: Record<string, string> = {
  vs: 'vscode',
  ff: 'firefox',
  gc: 'chrome',
  wa: 'whatsapp',
  tg: 'telegram',
  disc: 'discord',
}

export interface LaunchResult {
  handled: boolean
  reply?: string
  needsDesktop?: boolean
  target?: string
}

function parseTarget(prompt: string): string | null {
  const lower = prompt.toLowerCase().trim()
  if (!lower.startsWith('open ')) return null
  return lower
    .replace(/^open /, '')
    .replace(/\bthe\b/g, '')
    .replace(/\bplease\b/g, '')
    .trim()
}

/** Resolves aliases/abbreviations and fuzzy-matches against a known key set. */
function resolve(target: string, aliases: Record<string, string>, keys: string[]): string | null {
  if (aliases[target]) return aliases[target]
  if (keys.includes(target)) return target
  // Substring match either direction (e.g. "google chrome" contains "chrome").
  const match = keys.find((k) => target.includes(k) || k.includes(target))
  return match ?? null
}

/**
 * Intercepts "open X" style commands before they reach the LLM.
 * On desktop, actually launches the site/app via Tauri commands.
 * On web, opens websites in a new tab; local-app requests get a
 * "download the desktop app" prompt since browsers can't spawn processes.
 */
export async function tryHandleLaunchCommand(prompt: string): Promise<LaunchResult> {
  const target = parseTarget(prompt)
  if (target === null) return { handled: false }

  const desktop = isTauri()

  const siteKey = resolve(target, WEBSITE_ALIASES, Object.keys(WEBSITE_SHORTCUTS))
  if (siteKey) {
    const url = WEBSITE_SHORTCUTS[siteKey]
    if (desktop) {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('open_url', { url })
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    return { handled: true, reply: `🌐 Opening ${siteKey}. Locked in, W.` }
  }

  const appKey = resolve(target, LOCAL_APP_ALIASES, LOCAL_APP_SHORTCUTS)
  if (appKey) {
    if (desktop) {
      const { invoke } = await import('@tauri-apps/api/core')
      try {
        await invoke('open_app', { target: appKey })
        return { handled: true, reply: `🖥️ ${appKey.charAt(0).toUpperCase() + appKey.slice(1)} launched.` }
      } catch (e) {
        return { handled: true, reply: `⚠️ Couldn't launch ${appKey}: ${String(e)}` }
      }
    }
    return { handled: true, needsDesktop: true, target: appKey }
  }

  // Unknown target: be honest instead of pretending to open it.
  if (target) {
    const query = `https://www.google.com/search?q=${encodeURIComponent(target)}`
    if (desktop) {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('open_url', { url: query })
    } else {
      window.open(query, '_blank', 'noopener,noreferrer')
    }
    return {
      handled: true,
      reply: `🔍 I don't have "${target}" mapped to a site or app yet, so I pulled up a search for it instead.`,
    }
  }

  return { handled: false }
}
