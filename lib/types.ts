export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  metadata?: {
    source?: 'text' | 'voice'
    tokens?: number
  }
}

export interface ConversationMemory {
  id: string
  userId: string
  messages: Message[]
  summary: string
  embedding?: number[]
  createdAt: Date
  updatedAt: Date
}

export interface VoiceInput {
  blob: Blob
  duration: number
  timestamp: Date
}

export interface ToolResult {
  type: 'text' | 'image' | 'link'
  content: string
  source?: string
}
