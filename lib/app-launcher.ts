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
}

const LOCAL_APP_SHORTCUTS = ['notepad', 'calculator', 'calc', 'explorer', 'files', 'paint', 'terminal', 'cmd', 'command prompt']

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

  if (target in WEBSITE_SHORTCUTS) {
    const url = WEBSITE_SHORTCUTS[target]
    if (desktop) {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('open_url', { url })
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    return { handled: true, reply: `🌐 Opening ${target}. Locked in, W.` }
  }

  if (LOCAL_APP_SHORTCUTS.some((app) => target.includes(app))) {
    if (desktop) {
      const { invoke } = await import('@tauri-apps/api/core')
      try {
        await invoke('open_app', { target })
        return { handled: true, reply: `🖥️ ${target.charAt(0).toUpperCase() + target.slice(1)} launched.` }
      } catch (e) {
        return { handled: true, reply: `⚠️ Couldn't launch ${target}: ${String(e)}` }
      }
    }
    return { handled: true, needsDesktop: true, target }
  }

  if (target && !desktop) {
    // Unknown target on web: best effort, just a Google search tab
    const url = `https://www.google.com/search?q=${encodeURIComponent(target)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    return { handled: true, reply: `🌐 Couldn't find an exact match, so I pulled up a search for "${target}", bestie.` }
  }

  if (target && desktop) {
    const clean = target.replace(/\s+/g, '')
    const { invoke } = await import('@tauri-apps/api/core')
    const url = clean.includes('.') ? `https://${clean}` : `https://www.google.com/search?q=${encodeURIComponent(target)}`
    await invoke('open_url', { url })
    return { handled: true, reply: `🌐 Opening "${target}" for you, bestie.` }
  }

  return { handled: false }
}
