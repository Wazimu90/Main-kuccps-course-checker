"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatbotPlaceholder() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm the KUCCPS Course Expert. How can I help you with course selection, cluster points, or placement today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

      const responseContent = getMockResponse(userMessage.content)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Failed to get response", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[500px]">
      <Card className="flex-1 flex flex-col bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            KUCCPS Course Expert
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  message.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === "user" ? "bg-blue-600" : "bg-purple-600"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white/10 text-white border border-white/10 rounded-tl-none"
                  )}
                >
                  {message.content}
                  <div className="text-[10px] opacity-50 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white/10 text-white border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-black/20 border-t border-white/10">
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder="Type your question about courses..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white/5 border-white/20 text-light placeholder:text-light min-h-[50px] max-h-[150px] resize-none focus-visible:ring-offset-0 focus-visible:ring-purple-500"
                rows={1}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                className="bg-white text-black hover:bg-white/90 h-[50px] w-[50px] rounded-lg flex-shrink-0 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="text-[10px] text-light mt-2 text-center">
              Enter to send, Shift + Enter for new line
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getMockResponse(input: string): string {
  const lowerInput = input.toLowerCase()
  
  if (lowerInput.includes("cluster") || lowerInput.includes("points")) {
    return "Cluster points are calculated based on your KCSE subject performance. For degree programmes, we use 4 subjects: Mathematics, English/Kiswahili, and the two best other subjects relevant to the course. Would you like me to help you calculate yours?"
  }
  
  if (lowerInput.includes("grade") || lowerInput.includes("score")) {
    return "Your mean grade determines the level of courses you can apply for. C+ and above qualifies for Degree, C- and above for Diploma, and D and above for Certificate courses. What was your mean grade?"
  }
  
  if (lowerInput.includes("medicine") || lowerInput.includes("nursing") || lowerInput.includes("doctor")) {
    return "Medical courses typically require strong grades in Biology, Chemistry, Mathematics/Physics, and English/Kiswahili. For Medicine, you usually need at least a B+ mean grade with B+ in the cluster subjects."
  }
  
  if (lowerInput.includes("engineering")) {
    return "Engineering courses heavily rely on Mathematics and Physics. Most universities require at least a C+ in these subjects, along with a good overall mean grade."
  }
  
  if (lowerInput.includes("apply") || lowerInput.includes("register")) {
    return "You can apply for courses through the KUCCPS student portal when the window is open. Make sure you have your KCSE index number and year ready."
  }
  
  return "That's a great question about KUCCPS placement. While I'm a simulated assistant, I'd recommend checking the 'Results' page after entering your grades to see exactly which courses you qualify for based on the official requirements."
}
