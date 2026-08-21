'use client'

import { useEffect, useRef, useState } from 'react'
import { Message } from '@/lib/types'
import { MessageDisplay } from './message-display'
import { ChatInput } from './chat-input'
import { Sidebar } from './sidebar'
import { SettingsModal } from './settings-modal'
import { Zap, Settings as SettingsIcon } from 'lucide-react'
import { streamChat, ChatError } from '@/lib/chat-client'
import {
  AppSettings,
  isTauri,
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistory,
  clearHistory,
} from '@/lib/local-store'

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({ activeProvider: null, apiKeys: {} })
  const [desktop, setDesktop] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [conversationId] = useState(() => `conv-${Date.now()}`)

  useEffect(() => {
    setMessages(loadHistory())
    setSettings(loadSettings())
    setDesktop(isTauri())
  }, [])

  useEffect(() => {
    if (messages.length > 0) saveHistory(messages)
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSaveSettings = (next: AppSettings) => {
    setSettings(next)
    saveSettings(next)
  }

  const handleClearHistory = () => {
    setMessages([])
    clearHistory()
  }

  const handleSendMessage = async (content: string, source: 'text' | 'voice' = 'text') => {
    if (!content.trim()) return
    setLastError(null)

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      role: 'user',
      timestamp: new Date(),
      metadata: { source },
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setIsLoading(true)

    const aiMessageId = `msg-${Date.now()}-ai`
    let aiContent = ''

    const appendPlaceholder = () => {
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, content: '', role: 'assistant', timestamp: new Date() },
      ])
    }

    const updateAiMessage = (text: string) => {
      aiContent += text
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMessageId ? { ...m, content: aiContent } : m))
      )
    }

    try {
      if (desktop) {
        const provider = settings.activeProvider
        const apiKey = provider ? settings.apiKeys[provider] : undefined

        if (!provider || !apiKey) {
          setIsLoading(false)
          setShowSettings(true)
          setLastError('Add an API key in Settings to start chatting.')
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
          return
        }

        appendPlaceholder()
        await streamChat({
          provider,
          apiKey,
          messages: nextMessages,
          onToken: updateAiMessage,
        })
      } else {
        appendPlaceholder()
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages, conversationId }),
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new ChatError(body.error || `Server error ${response.status}`, 'unknown', false)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new ChatError('No response stream', 'unknown', false)

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
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
                updateAiMessage(data.delta.text)
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      if (!aiContent) {
        setMessages((prev) => prev.filter((m) => m.id !== aiMessageId))
        throw new ChatError('Empty response from provider', 'unknown', true)
      }
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== aiMessageId))
      const message =
        error instanceof ChatError
          ? error.message
          : 'Something went wrong. Check your connection and try again.'
      setLastError(message)
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          content: `⚠️ ${message}`,
          role: 'assistant',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        messageCount={messages.length}
        onClear={handleClearHistory}
        onOpenSettings={() => setShowSettings(true)}
        desktop={desktop}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <div className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 bg-slate-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="adam-title">TRUE ADAM</h1>
                <p className="adam-subtitle">
                  {desktop ? 'Desktop' : 'Web'} • Free APIs
                  {settings.activeProvider ? ` • ${settings.activeProvider}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5 text-slate-400" />
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="space-y-4">
                <div className="inline-block p-3 rounded-lg bg-slate-800 text-slate-400">
                  <Zap className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-100">Start chatting</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                  {desktop
                    ? 'Add a free API key in Settings to get started.'
                    : 'Powered by Groq, Cerebras, and other free APIs. No limits, no bills.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-md mx-auto">
                  {['Research', 'Code', 'Ideas', 'Explain'].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(`${prompt} something for me`)}
                      className="adam-button text-sm py-2"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => <MessageDisplay key={message.id} message={message} />)
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="inline-flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-200" />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
