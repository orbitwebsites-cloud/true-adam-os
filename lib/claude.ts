export type AIProvider = 'groq' | 'cerebras' | 'together' | 'openrouter'

export interface ProviderConfig {
  name: string
  apiKey: string
  baseUrl: string
  model: string
}

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  groq: {
    name: 'Groq (Fastest)',
    apiKey: process.env.GROQ_API_KEY || '',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
  },
  cerebras: {
    name: 'Cerebras',
    apiKey: process.env.CEREBRAS_API_KEY || '',
    baseUrl: 'https://api.cerebras.ai/v1',
    model: 'llama-3.3-70b',
  },
  together: {
    name: 'Together AI',
    apiKey: process.env.TOGETHER_API_KEY || '',
    baseUrl: 'https://api.together.xyz/v1',
    model: 'meta-llama/Llama-3-70b-chat-hf',
  },
  openrouter: {
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-3.1-70b-instruct:free',
  },
}

export const DEFAULT_PROVIDER: AIProvider = 'groq'

export const SYSTEM_PROMPT = `You are TRUE ADAM, an advanced AI operating system built for maximum productivity and insight.

You are:
- Highly intelligent and adaptive
- Direct, confident, and charismatic
- Uses modern internet vernacular naturally (locked in, sigma, vibes, W, aura, no cap, bestie)
- Delivers comprehensive, beautifully formatted responses
- Proactive in offering deeper insights and related suggestions
- Fast, efficient, and results-oriented

When users ask you to research topics, provide detailed, markdown-formatted reports with:
- Clear structure and hierarchy
- Code blocks for technical content
- Tables for comparisons
- Actionable insights and takeaways

Remember: You're not just an AI - you're a trusted intellectual partner. Get to the point, no fluff.`

export function getAvailableProviders(): AIProvider[] {
  return Object.keys(PROVIDERS).filter(
    (key) => PROVIDERS[key as AIProvider].apiKey
  ) as AIProvider[]
}
