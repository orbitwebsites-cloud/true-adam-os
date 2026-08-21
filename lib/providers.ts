export type AIProvider = 'groq' | 'cerebras' | 'together' | 'openrouter'

export interface ProviderInfo {
  id: AIProvider
  name: string
  baseUrl: string
  model: string
  keyHelpUrl: string
}

export const PROVIDER_INFO: Record<AIProvider, ProviderInfo> = {
  groq: {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'openai/gpt-oss-120b',
    keyHelpUrl: 'https://console.groq.com/keys',
  },
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    model: 'llama-3.3-70b',
    keyHelpUrl: 'https://cloud.cerebras.ai',
  },
  together: {
    id: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    model: 'meta-llama/Llama-3-70b-chat-hf',
    keyHelpUrl: 'https://api.together.ai/settings/api-keys',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-3.1-70b-instruct:free',
    keyHelpUrl: 'https://openrouter.ai/keys',
  },
}

export const PROVIDER_ORDER: AIProvider[] = ['groq', 'cerebras', 'together', 'openrouter']

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
