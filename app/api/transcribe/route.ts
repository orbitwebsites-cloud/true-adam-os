import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('file') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Use Anthropic's audio capabilities or external transcription service
    // For now, returning a placeholder that works with Vercel
    const buffer = await audioFile.arrayBuffer()

    // Placeholder: In production, integrate with Whisper API or similar
    // This would transcribe the audio to text
    const text = '[Transcription service would process audio here]'

    return NextResponse.json({ text, duration: 0 })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}
