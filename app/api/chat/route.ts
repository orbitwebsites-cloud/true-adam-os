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

    const config = PROVIDERS[provider]

    if (!config.apiKey) {
      return NextResponse.json(
        { error: `Provider ${provider} not configured` },
        { status: 500 }
      )
    }

    // Format messages for OpenAI-compatible API
    const formattedMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Stream response from provider
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
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

    if (!response.ok) {
      const error = await response.text()
      console.error('Provider error:', error)
      return NextResponse.json(
        { error: `AI Provider error: ${response.status}` },
        { status: response.status }
      )
    }

    // Return the streaming response directly
    return new Response(response.body, {
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
