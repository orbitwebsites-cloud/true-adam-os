import { AIProvider, PROVIDER_INFO, SYSTEM_PROMPT } from './providers'
import { Message } from './types'

export class ChatError extends Error {
  constructor(
    message: string,
    public kind: 'auth' | 'rate_limit' | 'network' | 'no_key' | 'unknown',
    public retryable: boolean
  ) {
    super(message)
    this.name = 'ChatError'
  }
}

function classifyStatus(status: number): { kind: ChatError['kind']; retryable: boolean } {
  if (status === 401 || status === 403) return { kind: 'auth', retryable: false }
  if (status === 429) return { kind: 'rate_limit', retryable: true }
  if (status >= 500) return { kind: 'unknown', retryable: true }
  return { kind: 'unknown', retryable: false }
}

interface StreamOptions {
  provider: AIProvider
  apiKey: string
  messages: Message[]
  onToken: (text: string) => void
  signal?: AbortSignal
  maxRetries?: number
}

async function attemptStream(opts: StreamOptions): Promise<void> {
  const info = PROVIDER_INFO[opts.provider]

  const response = await fetch(`${info.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: opts.signal,
    body: JSON.stringify({
      model: info.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 2048,
      stream: true,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    const { kind, retryable } = classifyStatus(response.status)
    throw new ChatError(
      `${info.name} error ${response.status}: ${body.slice(0, 300)}`,
      kind,
      retryable
    )
  }

  const reader = response.body?.getReader()
  if (!reader) throw new ChatError('No response stream', 'unknown', true)

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        const text = parsed.choices?.[0]?.delta?.content
        if (text) opts.onToken(text)
      } catch {
        // skip malformed chunks
      }
    }
  }
}

/**
 * Streams a chat completion directly from the provider (client-side).
 * Retries transient failures (5xx, 429) with exponential backoff.
 * Used by the desktop build, which has no server to proxy through.
 */
export async function streamChat(opts: StreamOptions): Promise<void> {
  const maxRetries = opts.maxRetries ?? 2
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await attemptStream(opts)
      return
    } catch (error) {
      lastError = error
      const retryable = error instanceof ChatError ? error.retryable : true
      if (!retryable || attempt === maxRetries) break
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt))
    }
  }

  if (lastError instanceof ChatError) throw lastError
  throw new ChatError(String(lastError), 'network', false)
}
