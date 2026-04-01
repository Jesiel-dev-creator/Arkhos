'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Plus, Lightbulb, Paperclip, Image, FileCode,
  ChevronDown, Check, Sparkles, Zap, Brain,
  SendHorizontal
} from 'lucide-react'

// TYPES
interface Model {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  badge?: string
}

// MODEL SELECTOR
const models: Model[] = [
  { id: 'mistral-small', name: 'Mistral Small', description: 'Designer + Architect', icon: <Zap className="size-4 text-[#00D4EE]" />, badge: 'Default' },
  { id: 'devstral-small', name: 'Devstral Small', description: 'Code generation', icon: <Sparkles className="size-4 text-[#FF6B35]" /> },
  { id: 'ministral-3b', name: 'Ministral 3B', description: 'Fast planning', icon: <Brain className="size-4 text-[#DCE9F5]" /> },
]

function ModelSelector({ selectedModel = 'mistral-small', onModelChange }: {
  selectedModel?: string
  onModelChange?: (model: Model) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(models.find(m => m.id === selectedModel) || models[0])

  const handleSelect = (model: Model) => {
    setSelected(model)
    setIsOpen(false)
    onModelChange?.(model)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95"
      >
        {selected.icon}
        <span>{selected.name}</span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[220px] bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f]">
                Select Model
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                    selected.id === model.id ? 'bg-white/10 text-white' : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex-shrink-0">{model.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      {model.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#00D4EE]/20 text-[#00D4EE]">
                          {model.badge}
                        </span>
                      )}
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

// Typing placeholder prompts
const TYPING_PROMPTS = [
  "A landing page for a French bakery in Paris...",
  "A dark SaaS dashboard for project management...",
  "A portfolio site for a creative photographer...",
  "An Italian restaurant with online reservations...",
  "A fitness studio with class schedule and pricing...",
  "A B2B SaaS with enterprise pricing and social proof...",
]

function useTypingPlaceholder(prompts: string[], typingSpeed = 40, pauseTime = 2000, deleteSpeed = 20) {
  const [displayText, setDisplayText] = useState('')
  const [promptIndex, setPromptIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const currentPrompt = prompts[promptIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (isTyping) {
      if (displayText.length < currentPrompt.length) {
        // Type next character
        timeout = setTimeout(() => {
          setDisplayText(currentPrompt.slice(0, displayText.length + 1))
        }, typingSpeed + Math.random() * 30) // slight randomness for natural feel
      } else {
        // Done typing — pause then start deleting
        timeout = setTimeout(() => setIsTyping(false), pauseTime)
      }
    } else {
      if (displayText.length > 0) {
        // Delete characters (faster)
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, deleteSpeed)
      } else {
        // Done deleting — move to next prompt
        setPromptIndex((i) => (i + 1) % prompts.length)
        setIsTyping(true)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayText, isTyping, promptIndex, prompts, typingSpeed, pauseTime, deleteSpeed])

  return displayText
}

// CHAT INPUT — the reusable piece for landing page + generate page
export function ChatInput({ onSend, onPlan, placeholder = "What do you want to build?", disabled = false }: {
  onSend?: (message: string, model: string) => void
  onPlan?: (message: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const [message, setMessage] = useState('')
  const [selectedModel, setSelectedModel] = useState('mistral-small')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingText = useTypingPlaceholder(TYPING_PROMPTS)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend?.(message, selectedModel)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative w-full max-w-[680px] mx-auto group/chat">
      <style>{`
        .chat-textarea::-webkit-scrollbar { display: none; }
        .chat-textarea { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none group-focus-within/chat:from-[#FF6B35]/20 group-focus-within/chat:to-[#FF6B35]/5 transition-all duration-500" />
      <div className="relative rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] group-focus-within/chat:ring-[#FF6B35]/30 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)] group-focus-within/chat:shadow-[0_0_20px_rgba(255,107,53,0.12),0_0_4px_rgba(255,107,53,0.08)] transition-all duration-500">
        <div className="relative">
          {/* Typing placeholder overlay — only visible when textarea is empty and not focused */}
          {!message && !isFocused && (
            <div className="absolute inset-0 px-5 pt-5 pointer-events-none z-0">
              <span className="text-[15px] text-[#5a5a5f]">
                {typingText}
              </span>
              <span className="inline-block w-[2px] h-[18px] bg-[#5a5a5f]/60 ml-[1px] animate-pulse align-text-bottom" />
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused && !message ? placeholder : ""}
            disabled={disabled}
            className="chat-textarea relative z-10 w-full resize-none bg-transparent text-[15px] text-white placeholder-[#5a5a5f] px-5 pt-5 pb-4 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-40"
            style={{ height: '80px', minHeight: '80px', maxHeight: '200px', overflow: 'hidden', outline: 'none', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          />
        </div>

        <div className="flex items-center justify-end px-3 pb-3 pt-1">
          <div className="flex items-center gap-2">
            {onPlan && (
              <button
                onClick={() => onPlan?.(message)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <Lightbulb className="size-4" />
                <span className="hidden sm:inline">Plan first</span>
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_20px_rgba(255,107,53,0.3)]"
            >
              <span className="hidden sm:inline">Build</span>
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Full page export (for standalone use)
export function BoltStyleChat({ onSend, onPlan, placeholder }: {
  onSend?: (message: string, model: string) => void
  onPlan?: (message: string) => void
  placeholder?: string
}) {
  return <ChatInput onSend={onSend} onPlan={onPlan} placeholder={placeholder} />
}

export default BoltStyleChat;
