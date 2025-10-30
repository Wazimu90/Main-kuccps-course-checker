"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare, Bot, Users, TrendingUp, Upload, Trash2, Key, Save, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const mockConversations = [
  {
    id: 1,
    user: "John Doe",
    message: "What courses can I take with a C+ in Math?",
    response: "Based on your C+ in Math, you can consider courses like...",
    timestamp: "2 hours ago",
    status: "resolved",
  },
  {
    id: 2,
    user: "Jane Smith",
    message: "How do I calculate my cluster points?",
    response: "To calculate cluster points, you need to...",
    timestamp: "4 hours ago",
    status: "resolved",
  },
]

export default function ChatbotPage() {
  const { toast } = useToast()
  const [conversations, setConversations] = useState(mockConversations)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/plain") {
      setUploadedFile(file)
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a .txt file only.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    toast({
      title: "File Removed",
      description: "Training data file has been removed.",
    })
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)

    toast({
      title: "API Key Saved",
      description: "OpenRouter API key has been saved successfully.",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chatbot Management</h1>
          <p className="text-muted-foreground">Monitor and manage AI assistant interactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Currently chatting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Bot className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground">Average bot response</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="conversations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="settings">Bot Settings</TabsTrigger>
          <TabsTrigger value="training">Training Data</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Latest chatbot interactions with users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{conversation.user}</span>
                        <Badge variant={conversation.status === "resolved" ? "default" : "secondary"}>
                          {conversation.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{conversation.timestamp}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>User:</strong> {conversation.message}
                        </p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Bot:</strong> {conversation.response}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Full Chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Configuration</CardTitle>
              <CardDescription>Configure chatbot behavior and responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Chatbot</Label>
                  <p className="text-sm text-muted-foreground">Turn the chatbot on or off</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea
                  placeholder="Enter the welcome message for new users..."
                  defaultValue="Hello! I'm here to help you find the right courses based on your KCSE results. How can I assist you today?"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <Label>OpenRouter API Key</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your OpenRouter API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSaveApiKey} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save API Key"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenRouter Dashboard
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Data</CardTitle>
              <CardDescription>Upload training data to improve chatbot responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Upload Training Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a .txt file containing training data for the chatbot
                      </p>
                    </div>
                    <div className="mt-4">
                      <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </label>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
