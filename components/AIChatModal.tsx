"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Bot, User, Sparkles, AlertCircle } from "lucide-react"

interface AIChatModalProps {
    isOpen: boolean
    onClose: () => void
    contextData: any
}

interface Message {
    role: 'user' | 'model'
    content: string
}

const MAX_DAILY_MESSAGES = 5

export default function AIChatModal({ isOpen, onClose, contextData }: AIChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [limitReached, setLimitReached] = useState(false)
    const [messagesCount, setMessagesCount] = useState(0)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load initial state and check limits
    useEffect(() => {
        if (isOpen) {
            checkLimit()
            // If no messages, trigger initial analysis
            if (messages.length === 0) {
                triggerInitialAnalysis()
            }
        }
    }, [isOpen])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isLoading])

    const checkLimit = () => {
        const today = new Date().toISOString().split('T')[0]
        const storageKey = `ai_chat_usage_${today}`
        const count = parseInt(localStorage.getItem(storageKey) || "0")
        setMessagesCount(count)
        if (count >= MAX_DAILY_MESSAGES) {
            setLimitReached(true)
        } else {
            setLimitReached(false)
        }
    }

    const incrementUsage = () => {
        const today = new Date().toISOString().split('T')[0]
        const storageKey = `ai_chat_usage_${today}`
        const newCount = messagesCount + 1
        localStorage.setItem(storageKey, newCount.toString())
        setMessagesCount(newCount)
        if (newCount >= MAX_DAILY_MESSAGES) {
            setLimitReached(true)
        }
    }

    const triggerInitialAnalysis = async () => {
        // Don't count the initial analysis against the limit? 
        // Or do we? Let's say we don't count the "welcoming" analysis.
        setIsLoading(true)
        try {
            const response = await fetch("/api/cluster-ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: "Please analyze my results briefly and introduce yourself." }],
                    contextData
                })
            })
            const data = await response.json()
            if (data.content) {
                setMessages([
                    { role: "model", content: data.content }
                ])
            }
        } catch (error) {
            console.error("Failed to start chat", error)
            setMessages([
                { role: "model", content: "I'm having trouble connecting right now. Please try again later." }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading || limitReached) return

        const userMsg = inputValue.trim()
        setInputValue("")

        // Add user message immediately
        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
        setMessages(newMessages)
        setIsLoading(true)

        // Increment usage
        incrementUsage()

        try {
            const response = await fetch("/api/cluster-ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    contextData
                })
            })

            const data = await response.json()

            if (data.content) {
                setMessages([...newMessages, { role: 'model', content: data.content }])
            } else {
                setMessages([...newMessages, { role: 'model', content: "Sorry, I couldn't process that. Please try again." }])
            }

        } catch (error) {
            console.error("Chat error", error)
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
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between shadow-lg z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Bingwa AI Assistant</h3>
                                    <p className="text-purple-100 text-xs flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Online • {Math.max(0, MAX_DAILY_MESSAGES - messagesCount)} messages left
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base/50">
                            {messages.length === 0 && isLoading && (
                                <div className="flex justify-center items-center h-full text-dim flex-col gap-3">
                                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm">Analyzing your results...</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-purple-600 text-white rounded-br-none'
                                                : 'bg-white/10 text-light border border-white/5 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="whitespace-pre-line">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && messages.length > 0 && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-2 items-center">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
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
                                    You have reached your daily limit of {MAX_DAILY_MESSAGES} messages. Please come back tomorrow!
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
                                    placeholder={limitReached ? "Daily limit reached" : "Ask about your courses..."}
                                    disabled={limitReached || isLoading}
                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-light placeholder:text-dim focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading || limitReached}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-white/5 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
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
