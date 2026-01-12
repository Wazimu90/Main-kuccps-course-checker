"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Bot, User, Sparkles, AlertCircle, Newspaper } from "lucide-react"

interface NewsChatModalProps {
    isOpen: boolean
    onClose: () => void
    articles: any[]
}

interface Message {
    role: 'user' | 'model'
    content: string
}

const MAX_DAILY_MESSAGES = 5

export default function NewsChatModal({ isOpen, onClose, articles }: NewsChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [limitReached, setLimitReached] = useState(false)
    const [messagesCount, setMessagesCount] = useState(0)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            checkLimit()
            if (messages.length === 0) {
                triggerInitialGreeting()
            }
        }
    }, [isOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isLoading])

    const checkLimit = () => {
        const today = new Date().toISOString().split('T')[0]
        const storageKey = `news_ai_usage_${today}`
        const count = parseInt(localStorage.getItem(storageKey) || "0")
        setMessagesCount(count)
        setLimitReached(count >= MAX_DAILY_MESSAGES)
    }

    const incrementUsage = () => {
        const today = new Date().toISOString().split('T')[0]
        const storageKey = `news_ai_usage_${today}`
        const newCount = messagesCount + 1
        localStorage.setItem(storageKey, newCount.toString())
        setMessagesCount(newCount)
        if (newCount >= MAX_DAILY_MESSAGES) {
            setLimitReached(true)
        }
    }

    const triggerInitialGreeting = async () => {
        setMessages([
            { role: "model", content: "Hi! I'm your News Assistant. Ask me anything about the latest updates in education or technology!" }
        ])
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || limitReached) return

        const userMsg = inputValue.trim()
        setInputValue("")

        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
        setMessages(newMessages)
        setIsLoading(true)
        incrementUsage()

        try {
            const response = await fetch("/api/news-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    contextData: { articles }
                })
            })

            const data = await response.json()

            if (data.content) {
                setMessages([...newMessages, { role: 'model', content: data.content }])
            } else {
                setMessages([...newMessages, { role: 'model', content: "Sorry, I couldn't process that request." }])
            }

        } catch (error) {
            console.error("News Chat error", error)
            setMessages([...newMessages, { role: 'model', content: "Network error. Please try again." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-surface border border-white/10 w-full max-w-lg h-[600px] max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 flex items-center justify-between shadow-lg z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <Newspaper className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">News Assistant</h3>
                                    <p className="text-blue-100 text-xs flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Online • {Math.max(0, MAX_DAILY_MESSAGES - messagesCount)} left
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base/50">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white/10 text-light border border-white/5 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="whitespace-pre-line">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-2 items-center">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Limit Warning */}
                        {limitReached && (
                            <div className="bg-amber-500/10 border-t border-amber-500/20 p-3 flex items-center gap-3 px-4">
                                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <p className="text-xs text-amber-200">
                                    Daily message limit reached.
                                </p>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-surface border-t border-white/10">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                className="flex gap-2 relative"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={limitReached ? "Limit reached" : "Ask about a news topic..."}
                                    disabled={limitReached || isLoading}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-light placeholder:text-dim focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading || limitReached}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 text-white p-3 rounded-xl transition-all disabled:opacity-50 shadow-lg"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
