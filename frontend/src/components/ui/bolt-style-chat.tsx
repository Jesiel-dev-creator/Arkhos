'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Plus, Lightbulb, Paperclip, Image as ImageIcon, FileCode, ChevronDown, Check, Sparkles, Zap, Brain, SendHorizontal } from 'lucide-react'

interface Model { id: string; name: string; description: string; icon: React.ReactNode; badge?: string; }

const models: Model[] = [
  { id: "mistral-small", name: "Mistral Small", description: "Designer + Architect", icon: <Zap className="size-4 text-[#00D4EE]" />, badge: "Default" },
  { id: "devstral-small", name: "Devstral Small", description: "Code generation", icon: <Sparkles className="size-4 text-[#FF6B35]" /> },
  { id: "ministral-3b", name: "Ministral 3B", description: "Fast planning", icon: <Brain className="size-4 text-[#DCE9F5]" /> },
]

function ModelSelector({ selectedModel = 'mistral-small', onModelChange }: { selectedModel?: string; onModelChange?: (model: Model) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(models.find(m => m.id === selectedModel) || models[0])
  const handleSelect = (model: Model) => { setSelected(model); setIsOpen(false); onModelChange?.(model); }
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95">
        {selected.icon}
        <span>{selected.name}</span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[200px] bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f]">Select Model</div>
              {models.map((model) => (
                <button key={model.id} onClick={() => handleSelect(model)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${selected.id === model.id ? 'bg-white/10 text-white' : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'}`}>
                  <div className="flex-shrink-0">{model.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      {model.badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#00D4EE]/20 text-[#00D4EE]">{model.badge}</span>}
                    </div>
                    <span className="text-[11px] text-[#6a6a6f]">{model.description}</span>
                  </div>
                  {selected.id === model.id && <Check className="size-4 text-[#00D4EE] flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function BoltStyleChat({ placeholder = "Describe your website in plain language...", onSend, onPlan }: {
  placeholder?: string; onSend?: (message: string, model: string) => void; onPlan?: (message: string) => void;
}) {
  const [message, setMessage] = useState('')
  const [selectedModel, setSelectedModel] = useState('mistral-small')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const placeholders = [
    "A landing page for a French bakery in Paris...",
    "A dark SaaS product for project management...",
    "A portfolio for a creative photographer...",
    "An Italian restaurant with online reservations...",
    "A fitness studio with class schedule and pricing...",
  ]
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIndex(i => (i + 1) % placeholders.length), 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) { textarea.style.height = 'auto'; textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px` }
  }, [message])

  const handleSubmit = () => { if (message.trim()) { onSend?.(message, selectedModel); setMessage('') } }
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
      <div className="relative rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)]">
        <textarea ref={textareaRef} value={message} onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown} placeholder={placeholders[placeholderIndex]}
          className="w-full resize-none bg-transparent text-[15px] text-white placeholder-[#5a5a5f] px-5 pt-5 pb-3 focus:outline-none min-h-[80px] max-h-[200px] transition-all"
          style={{ height: '80px' }} />
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <button className="flex items-center justify-center size-8 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-[#8a8a8f] hover:text-white transition-all duration-200 active:scale-95">
              <Plus className="size-4" />
            </button>
            <ModelSelector selectedModel={selectedModel} onModelChange={(m) => setSelectedModel(m.id)} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onPlan?.(message)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-all duration-200">
              <Lightbulb className="size-4" />
              <span className="hidden sm:inline">Plan first</span>
            </button>
            <button onClick={handleSubmit} disabled={!message.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_20px_rgba(255,107,53,0.3)]">
              <span className="hidden sm:inline">Build</span>
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoltStyleChat;
