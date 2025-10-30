"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Send, X, Minimize2, Bot, User, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  getChatbotSettings,
  getChatbotApiKey,
  getChatbotContexts,
  saveChatHistory,
  sendChatMessage,
  type ChatbotSettings,
} from "@/lib/chatbot-service"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatbotAssistantProps {
  userCourses: any[]
  userEmail?: string
  userName?: string
  resultId?: string
}

export default function ChatbotAssistant({ userCourses, userEmail, userName, resultId }: ChatbotAssistantProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Configuration state
  const [settings, setSettings] = useState<ChatbotSettings | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [context, setContext] = useState<string>("")
  const [isConfigured, setIsConfigured] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const loadConfiguration = async () => {
    try {
      // Load settings
      const chatbotSettings = await getChatbotSettings()
      setSettings(chatbotSettings)

      // Load API key
      const key = await getChatbotApiKey()
      setApiKey(key)

      // Load context
      const contexts = await getChatbotContexts()
      const activeContext = contexts.find((c) => c.is_active)
      if (activeContext) {
        setContext(activeContext.content)
      }

      // Check if chatbot is properly configured
      const configured = chatbotSettings?.enabled && key && contexts.length > 0
      setIsConfigured(configured)

      // Add welcome message if configured
      if (configured && chatbotSettings?.welcome_message) {
        setMessages([
          {
            id: `welcome_${Date.now()}`,
            content: chatbotSettings.welcome_message,
            sender: "bot",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error loading chatbot configuration:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isConfigured) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Send message to AI
      const response = await sendChatMessage(userMessage.content, context, userCourses, apiKey!)

      // Add bot response
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        content: response,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      // Save to history
      if (userEmail) {
        await saveChatHistory(userEmail, userName || "Unknown User", userMessage.content, response, sessionId, resultId)
      }
    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: "Sorry, I'm having trouble responding right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const minimizeChat = () => {
    setIsMinimized(!isMinimized)
  }

  // Don't render if chatbot is disabled
  if (!settings?.enabled) {
    return null
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={toggleChat}
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            {/* Notification Badge */}
            {userCourses.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-background">AI</Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] md:w-96"
          >
            <Card className="shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
              {/* Chat Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    </div>
                    <div>
                      <CardTitle className="text-sm">Course Assistant</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {isConfigured ? "Online" : "Configuration needed"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={minimizeChat} className="h-8 w-8">
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Content */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Configuration Warning */}
                      {!isConfigured && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b">
                          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm">Chatbot needs configuration. Please contact admin.</p>
                          </div>
                        </div>
                      )}

                      {/* Messages Area */}
                      <div className="h-80 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && isConfigured && (
                          <div className="text-center text-muted-foreground text-sm py-8">
                            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Start a conversation about your qualified courses!</p>
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
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}

                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                message.sender === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>

                            {message.sender === "user" && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </motion.div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="h-3 w-3 text-primary-foreground" />
                            </div>
                            <div className="bg-muted rounded-2xl px-4 py-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input Area */}
                      <div className="p-4 border-t">
                        <div className="flex gap-2">
                          <Input
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isConfigured ? "Ask about your courses..." : "Chatbot not configured"}
                            disabled={isLoading || !isConfigured}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputMessage.trim() || !isConfigured}
                            size="icon"
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>

                        {isConfigured && (
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Ask me about your {userCourses.length} qualified courses
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
