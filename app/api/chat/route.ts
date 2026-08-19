import { NextRequest, NextResponse } from 'next/server'
import { claude, SYSTEM_PROMPT } from '@/lib/claude'
import { Message } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { messages, conversationId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Format messages for Claude
    const formattedMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }))

    const stream = await claude.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: formattedMessages,
    })

    // Return streaming response
    return new Response(stream.toReadableStream(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
