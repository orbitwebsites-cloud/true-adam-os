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

function resolveWebsite(target: string): string | null {
  if (WEBSITE_ALIASES[target]) return WEBSITE_ALIASES[target]
  if (WEBSITE_SHORTCUTS[target]) return target
  const keys = Object.keys(WEBSITE_SHORTCUTS)
  return keys.find((k) => target.includes(k) || k.includes(target)) ?? null
}

/**
 * Intercepts "open X" style commands before they reach the LLM.
 *
 * Websites are matched against a curated list (with abbreviations). Local
 * apps are NOT guessed client-side: on desktop, the actual matching against
 * everything installed (Start Menu + registry) happens in Rust via
 * `open_app`, since only the OS can know what's really on the machine. On
 * web, local-app requests are pointed at the desktop download instead of
 * faking a result — a browser genuinely cannot launch a process.
 */
export async function tryHandleLaunchCommand(prompt: string): Promise<LaunchResult> {
  const target = parseTarget(prompt)
  if (target === null) return { handled: false }

  const desktop = isTauri()

  const siteKey = resolveWebsite(target)
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

  if (desktop) {
    const { invoke } = await import('@tauri-apps/api/core')
    try {
      await invoke('open_app', { target })
      return { handled: true, reply: `🖥️ Launched ${target}.` }
    } catch (e) {
      return {
        handled: true,
        reply: `⚠️ Couldn't find "${target}" installed, or "${target}" as a known site. Try being more specific?`,
      }
    }
  }

  // Web: can't launch local processes from a browser — be upfront about it.
  return { handled: true, needsDesktop: true, target }
}
