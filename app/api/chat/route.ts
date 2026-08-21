import { NextRequest, NextResponse } from 'next/server'
import { PROVIDERS, DEFAULT_PROVIDER, SYSTEM_PROMPT, AIProvider, getAvailableProviders } from '@/lib/claude'
import { Message } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationId, provider: requestedProvider } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Select provider - use requested or default
    const availableProviders = getAvailableProviders()

    if (availableProviders.length === 0) {
      return NextResponse.json(
        { error: 'No AI providers configured. Set API keys in environment.' },
        { status: 500 }
      )
    }

    let provider = requestedProvider as AIProvider
    if (!provider || !PROVIDERS[provider] || !PROVIDERS[provider].apiKey) {
      provider = availableProviders[0] || DEFAULT_PROVIDER
    }

    // Format messages for OpenAI-compatible API
    const formattedMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Try the selected provider first, then fall back through the rest.
    // Retries transient errors (429/5xx) with backoff before moving on.
    const orderedProviders = [
      provider,
      ...availableProviders.filter((p) => p !== provider),
    ]

    let response: Response | null = null
    let lastErrorBody = ''
    let lastStatus = 500
    let usedProvider = provider

    outer: for (const candidate of orderedProviders) {
      const config = PROVIDERS[candidate]
      const maxRetries = 2

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const attemptResponse = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: config.model,
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...formattedMessages,
              ],
              max_tokens: 2048,
              stream: true,
              temperature: 0.7,
            }),
          })

          if (attemptResponse.ok) {
            response = attemptResponse
            usedProvider = candidate
            break outer
          }

          lastStatus = attemptResponse.status
          lastErrorBody = await attemptResponse.text()
          console.error(`Provider ${candidate} error (attempt ${attempt}):`, lastErrorBody)

          const retryable = attemptResponse.status === 429 || attemptResponse.status >= 500
          if (!retryable) break // move to next provider immediately
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 400 * 2 ** attempt))
          }
        } catch (err) {
          lastErrorBody = String(err)
          console.error(`Provider ${candidate} network error (attempt ${attempt}):`, err)
          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 400 * 2 ** attempt))
          }
        }
      }
    }

    if (!response) {
      return NextResponse.json(
        {
          error: `All providers failed (last: ${usedProvider}, status ${lastStatus})`,
          details: lastErrorBody,
        },
        { status: lastStatus >= 400 ? lastStatus : 502 }
      )
    }

    // Transform the streaming response
    const reader = response.body?.getReader()
    if (!reader) {
      return NextResponse.json(
        { error: 'No response stream' },
        { status: 500 }
      )
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const decoder = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.choices?.[0]?.delta?.content) {
                    const text = parsed.choices[0].delta.content
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text } })}\n\n`))
                  }
                } catch (e) {
                  // Skip parse errors
                }
              }
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request', details: String(error) },
      { status: 500 }
    )
  }
}

// Endpoint to get available providers
export async function GET(request: NextRequest) {
  const available = getAvailableProviders()
  return NextResponse.json({
    providers: available.map(p => ({
      id: p,
      name: PROVIDERS[p].name,
      model: PROVIDERS[p].model,
    })),
    default: available[0] || DEFAULT_PROVIDER,
  })
}
