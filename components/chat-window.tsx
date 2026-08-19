'use client'

import { useEffect, useRef, useState } from 'react'
import { Message } from '@/lib/types'
import { MessageDisplay } from './message-display'
import { ChatInput } from './chat-input'
import { Sidebar } from './sidebar'
import { Zap } from 'lucide-react'

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [conversationId] = useState(() => `conv-${Date.now()}`)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string, source: 'text' | 'voice' = 'text') => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
      metadata: { source },
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let aiContent = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'content_block_delta' && data.delta.type === 'text_delta') {
                aiContent += data.delta.text
              }
            } catch {
              // Parse error, continue
            }
          }
        }
      }

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        content: aiContent || 'Unable to generate response',
        role: 'assistant',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        content: '⚠️ Error communicating with Claude. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        messageCount={messages.length}
        onClear={() => setMessages([])}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-cyan-700/30 bg-slate-900/30 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="adam-title text-2xl">TRUE ADAM</h1>
                <p className="adam-subtitle">AI Operating System • Claude 3.5</p>
              </div>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="space-y-4">
                <div className="inline-block p-4 rounded-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-600/30">
                  <Zap className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="adam-title text-3xl">Ready to lock in?</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Ask me anything. Research topics, write code, brainstorm ideas, or just chat. I've got persistent memory so I remember our conversations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-md mx-auto">
                  {[
                    'Research a topic',
                    'Write code',
                    'Brainstorm ideas',
                    'Explain concepts',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="adam-button text-sm py-2"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageDisplay key={message.id} message={message} />
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="inline-flex gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200" />
              </div>
              <span className="text-sm">Adam is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
