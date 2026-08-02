'use client'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
  is_emergency?: boolean
}

const API_URL = 'https://homecareai-backend.onrender.com'

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initial = localStorage.getItem('initial_message')
    if (initial) {
      localStorage.removeItem('initial_message')
      sendMessage(initial)
    } else {
      setMessages([{
        role: 'assistant',
        content: "Namaste! I'm HomeCare AI. I'll help you with natural remedies and safe home care tips. How are you feeling today?"
      }])
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        messages: updatedMessages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })

      const assistantMsg: Message = {
        role: 'assistant',
        content: res.data.reply,
        is_emergency: res.data.is_emergency
      }

      setMessages([...updatedMessages, assistantMsg])
    } catch (err) {
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input)
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">

      <div className="relative z-10 min-h-screen flex flex-col">

        <div className="bg-white/70 backdrop-blur-md border-b border-green-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-green-800 text-lg">HomeCare AI</span>
          </div>
          <a
            href="/"
            className="text-sm text-green-700 hover:text-green-900 bg-white/70 px-4 py-2 rounded-full border border-green-200 hover:bg-white transition-all"
          >
            Home
          </a>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm shrink-0">
                    🌿
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-br-sm'
                      : msg.is_emergency
                      ? 'bg-red-50 border border-red-300 text-red-800 rounded-bl-sm'
                      : 'bg-white/80 backdrop-blur-sm border border-green-200 text-green-900 rounded-bl-sm'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(msg.content)
                  }}
                />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm">
                  🌿
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-green-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-md">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="bg-white/70 backdrop-blur-md border-t border-green-200 px-4 py-3">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-3xl mx-auto bg-white/80 rounded-full p-2 shadow-md border border-green-200"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptom..."
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-green-900 placeholder:text-green-600/60 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 shadow-md transition-all"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}