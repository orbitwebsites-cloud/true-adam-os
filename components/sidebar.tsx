'use client'

import { X, Trash2, Settings, Info } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  messageCount: number
  onClear: () => void
  onOpenSettings: () => void
  desktop: boolean
}

export function Sidebar({
  isOpen,
  onClose,
  messageCount,
  onClear,
  onOpenSettings,
  desktop,
}: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-slate-900 border-r border-slate-700 flex flex-col transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            TRUE ADAM
          </h2>
          <p className="text-xs text-slate-500 mt-1">Free AI OS</p>
        </div>

        {/* Stats */}
        <div className="p-4 mx-4 mt-4 rounded-lg bg-slate-800 border border-slate-700">
          <div className="text-xs text-slate-400">
            <div className="flex justify-between mb-2">
              <span>Messages:</span>
              <span className="text-slate-300 font-semibold">{messageCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-slate-400 font-semibold">Ready</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-1 p-4 space-y-2">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase px-2">
              Conversation
            </h3>
            <button
              onClick={onClear}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase px-2">
              Settings
            </h3>
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              AI Providers
            </button>
          </div>

          {desktop && (
            <div className="space-y-1 pt-4 border-t border-slate-700 px-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">
                Shortcuts
              </h3>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Show / Hide window</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                  Ctrl+Shift+A
                </kbd>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1 pt-1">
                <Info className="w-3 h-3" />
                Closing the window minimizes to tray
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400 space-y-1">
          <p>Groq • Cerebras • Together</p>
          <p>Free APIs • No bills</p>
          <p className="pt-2 text-slate-500">
            {desktop ? 'Desktop app (Tauri)' : 'Next.js on Vercel'}
          </p>
        </div>
      </aside>
    </>
  )
}
