'use client'

import { ChatWindow } from '@/components/chat-window'

export default function Home() {
  return (
    <main className="h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col">
      <ChatWindow />
    </main>
  )
}
