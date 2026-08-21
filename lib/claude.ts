import { AIProvider, PROVIDER_INFO, PROVIDER_ORDER, SYSTEM_PROMPT } from './providers'

export { SYSTEM_PROMPT }
export type { AIProvider }

export interface ProviderConfig {
  name: string
  apiKey: string
  baseUrl: string
  model: string
}

function envKey(provider: AIProvider): string {
  switch (provider) {
    case 'groq':
      return process.env.GROQ_API_KEY || ''
    case 'cerebras':
      return process.env.CEREBRAS_API_KEY || ''
    case 'together':
      return process.env.TOGETHER_API_KEY || ''
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY || ''
  }
}

export const PROVIDERS: Record<AIProvider, ProviderConfig> = Object.fromEntries(
  PROVIDER_ORDER.map((id) => [
    id,
    {
      name: PROVIDER_INFO[id].name,
      apiKey: envKey(id),
      baseUrl: PROVIDER_INFO[id].baseUrl,
      model: PROVIDER_INFO[id].model,
    },
  ])
) as Record<AIProvider, ProviderConfig>

export const DEFAULT_PROVIDER: AIProvider = 'groq'

export function getAvailableProviders(): AIProvider[] {
  return PROVIDER_ORDER.filter((id) => PROVIDERS[id].apiKey)
}
