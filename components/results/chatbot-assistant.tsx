/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, Minimize2, Bot, User, Loader2, AlertCircle, Trash2, Copy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// ... imports ...

export default function ChatbotAssistant({ isOpen, onClose, selectedCategory, qualifiedCourses }: ChatbotAssistantProps) {
  const { toast } = useToast()
  const [isConfigured, setIsConfigured] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  type ChatMessage = { id: string; content: string; sender: "bot" | "user"; timestamp: Date }
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState(
    qualifiedCourses && qualifiedCourses.length > 0 ? `You have ${qualifiedCourses.length} qualified courses.` : "How can I help you today?"
  )

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    const text = inputMessage.trim()
    if (!text || isLoading) return
    setIsLoading(true)
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, content: text, sender: "user", timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInputMessage("")
    setIsTyping(true)
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, selectedCategory, qualifiedCourses }),
      })
      const json = await res.json()
      const reply = res.ok ? String(json.reply || "") : String(json.error || "Failed to get a reply")
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        content: reply,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (e: any) {
      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        content: e?.message || "Network error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/assistant/settings", { cache: "no-store" })
        if (res.ok) {
          const json = await res.json()
          const status = String(json.settings?.status || "enabled")
          setIsConfigured(status === "enabled")
          const wm = String(json.settings?.welcome_message || "")
          if (wm) setWelcomeMessage(wm)
        }
      } catch {
        setIsConfigured(true)
      }
    }
    load()
  }, [])
  // ... state ...

  // ... useEffects ...

  const handleClearChat = () => {
    setMessages([])
    if (welcomeMessage) {
      setMessages([
        {
          id: `welcome_${Date.now()}`,
          content: welcomeMessage,
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }

  // ... handleSendMessage ...

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-4 right-4 z-50 w-[95vw] md:w-[420px] max-w-[420px] max-h-[80vh]"
        >
          <Card className="shadow-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <CardHeader className="p-4 border-b border-gray-100 bg-slate-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    {isConfigured && (
                      <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Course Assistant</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {isConfigured ? "Online & Ready" : "Offline"}
                      </span>
                      {qualifiedCourses.length > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                          {qualifiedCourses.length} Courses
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearChat}
                    className="h-8 w-8 text-slate-500 hover:text-destructive transition-colors dark:text-slate-400"
                    title="Clear conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                <CardContent className="p-0 flex flex-col h-[55vh] md:h-[60vh]">
                  {/* Warning if offline */}
                  {!isConfigured && (
                    <div className="p-3 bg-yellow-500/10 border-b border-yellow-500/20 mx-4 mt-4 rounded-lg">
                      <div className="flex items-start gap-3 text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Configuration Required</p>
                          <p className="opacity-90">The AI assistant needs to be configured in admin settings.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                    {messages.length === 0 && isConfigured && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                          <Bot className="h-8 w-8 opacity-50" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">How can I help you?</p>
                          <p className="text-sm mt-1">I can analyze your {qualifiedCourses.length} qualified courses and suggest the best options based on your grades.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                          {["Which are the best degree courses?", "Do I qualify for Engineering?", "Explain cluster points"].map((q) => (
                            <button
                              key={q}
                              onClick={() => {
                                setInputMessage(q)
                                // Optional: auto-send
                              }}
                              className="text-xs py-2 px-3 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-left"
                            >
                              "{q}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.sender === "bot" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted/80 text-foreground rounded-tl-sm border border-border/50"
                            }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          <p className={`text-[10px] mt-1.5 ${message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {message.sender === "bot" && (
                            <div className="mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(message.content)
                                    toast({ title: "Copied", description: "Assistant response copied to clipboard" })
                                  } catch (e: any) {
                                    toast({ title: "Copy failed", description: e?.message || "Unable to copy", variant: "destructive" })
                                  }
                                }}
                                className="h-7 px-2 text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" /> Copy
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted/80 rounded-2xl rounded-tl-sm px-4 py-4 border border-border/50">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800">
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                      className="flex gap-2"
                    >
                      <Input
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={isConfigured ? "Type your question..." : "Chatbot offline"}
                        disabled={isLoading || !isConfigured}
                        className="flex-1 bg-slate-50 text-slate-900 border-slate-200 placeholder:text-slate-500 focus-visible:ring-primary/20 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:placeholder:text-slate-400"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !inputMessage.trim() || !isConfigured}
                        size="icon"
                        className="bg-primary hover:bg-primary/90 shadow-md transition-all disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                    {isConfigured && (
                      <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                        AI has access to your results context
                      </p>
                    )}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
