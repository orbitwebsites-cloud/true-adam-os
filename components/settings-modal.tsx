'use client'

import { useState } from 'react'
import { X, ExternalLink, Check } from 'lucide-react'
import { AIProvider, PROVIDER_INFO, PROVIDER_ORDER } from '@/lib/providers'
import { AppSettings } from '@/lib/local-store'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings
  onSave: (settings: AppSettings) => void
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [draft, setDraft] = useState<AppSettings>(settings)

  if (!isOpen) return null

  const handleSave = () => {
    onSave(draft)
    onClose()
  }

  const setKey = (provider: AIProvider, value: string) => {
    setDraft((prev) => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: value },
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">AI Provider Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-400">
            Add a free API key for at least one provider. Keys are stored only on this device.
          </p>

          {PROVIDER_ORDER.map((id) => {
            const info = PROVIDER_INFO[id]
            const hasKey = !!draft.apiKeys[id]
            const isActive = draft.activeProvider === id

            return (
              <div
                key={id}
                className={`p-3 rounded-lg border transition-colors ${
                  isActive ? 'border-slate-500 bg-slate-800' : 'border-slate-700 bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100">{info.name}</span>
                    {hasKey && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                  <a
                    href={info.keyHelpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    Get key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={draft.apiKeys[id] || ''}
                    onChange={(e) => setKey(id, e.target.value)}
                    placeholder={`${info.name} API key`}
                    className="adam-input flex-1 text-sm"
                  />
                  <button
                    type="button"
                    disabled={!hasKey}
                    onClick={() => setDraft((prev) => ({ ...prev, activeProvider: id }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isActive ? 'Active' : 'Use'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800">
            Cancel
          </button>
          <button onClick={handleSave} className="adam-button text-sm">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
