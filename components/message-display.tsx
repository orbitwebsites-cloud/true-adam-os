'use client'

import { Message } from '@/lib/types'
import { User, Bot, Mic } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MessageDisplayProps {
  message: Message
}

export function MessageDisplay({ message }: MessageDisplayProps) {
  const isUser = message.role === 'user'
  const isVoice = message.metadata?.source === 'voice'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white">
          <Bot className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-2xl ${isUser ? 'adam-message-user' : 'adam-message-ai'}`}>
        {isVoice && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Mic className="w-3 h-3" />
            Voice input
          </div>
        )}
        <div className="prose prose-invert max-w-none text-sm leading-relaxed">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
              h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
              h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
              p: ({ node, ...props }: any) => <p className="my-2" {...props} />,
              ul: ({ node, ...props }: any) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
              ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
              code: ({ node, inline: isInline, ...props }: any) =>
                isInline ? (
                  <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs" {...props} />
                ) : (
                  <code className="block bg-slate-800/50 p-3 rounded my-2 text-cyan-300 font-mono text-xs overflow-x-auto" {...props} />
                ),
              a: ({ node, ...props }: any) => <a className="text-cyan-400 hover:text-cyan-300 underline" {...props} />,
              table: ({ node, ...props }: any) => (
                <div className="overflow-x-auto my-2">
                  <table className="w-full border-collapse border border-slate-700" {...props} />
                </div>
              ),
              th: ({ node, ...props }: any) => <th className="border border-slate-700 px-3 py-2 bg-slate-800/50" {...props} />,
              td: ({ node, ...props }: any) => <td className="border border-slate-700 px-3 py-2" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}
