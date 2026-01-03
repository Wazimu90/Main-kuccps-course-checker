"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { MessageSquare, Upload, Trash2, Key, Save, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ConversationRow {
  id: string
  user_email: string | null
  user_phone: string | null
  user_ip: string | null
  conversation: {
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
    meta?: { provider?: string; created_at?: string; result_id?: string | null }
  }
  created_at: string
}

export default function ChatbotPage() {
  const { toast } = useToast()
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [todayCount, setTodayCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<{ welcome_message: string; status: "enabled" | "disabled"; provider: string; system_prompt: string } | null>(null)
  const [chatPreview, setChatPreview] = useState<ConversationRow | null>(null)
  const [trainingFiles, setTrainingFiles] = useState<Array<{ id: string; file_name: string; file_path: string; uploaded_at: string }>>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [todRes, totRes, listRes, setRes, filesRes] = await Promise.all([
          fetch("/api/admin/chatbot/conversations?today=true", { cache: "no-store" }),
          fetch("/api/admin/chatbot/conversations?total=true", { cache: "no-store" }),
          fetch("/api/admin/chatbot/conversations", { cache: "no-store" }),
          fetch("/api/admin/chatbot/settings", { cache: "no-store" }),
          fetch("/api/admin/chatbot/training-files", { cache: "no-store" }),
        ])
        if (todRes.ok) {
          const j = await todRes.json()
          setTodayCount(j.today || 0)
        }
        if (totRes.ok) {
          const j = await totRes.json()
          setTotalCount(j.total || 0)
        }
        if (listRes.ok) {
          const j = await listRes.json()
          setConversations(j.conversations || [])
        }
        if (setRes.ok) {
          const j = await setRes.json()
          setSettings(
            j.settings || { welcome_message: "", status: "disabled", provider: "openrouter", system_prompt: "" },
          )
        }
        if (filesRes.ok) {
          const j = await filesRes.json()
          setTrainingFiles(j.files || [])
        }
      } catch (e) {}
    }
    load()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.toLowerCase().endsWith(".md")) {
      setUploadedFile(file)
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a .md file only.",
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
    if (!apiKey.trim() && settings) {
      // save other settings without key change
      setIsLoading(true)
      const res = await fetch("/api/admin/chatbot/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      setIsLoading(false)
      toast({
        title: res.ok ? "Settings Saved" : "Save Failed",
        description: res.ok ? "Chatbot settings updated." : "Could not update settings.",
        variant: res.ok ? undefined : "destructive",
      })
      return
    }
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const res = await fetch("/api/admin/chatbot/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(settings || {}), api_key: apiKey }),
    })
    setIsLoading(false)

    toast({
      title: res.ok ? "Settings Saved" : "Save Failed",
      description: res.ok ? "API key stored securely." : "Could not save settings.",
      variant: res.ok ? undefined : "destructive",
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
          <p className="text-white">Monitor and manage AI assistant interactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today’s Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-white">Chats started today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-white">All-time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="conversations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="settings">Bot Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Latest chatbot interactions with users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.map((row) => (
                  <div key={row.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{row.user_email || row.user_phone || "Anonymous"}</span>
                        <Badge variant="secondary">{row.conversation?.meta?.provider || "provider"}</Badge>
                      </div>
                      <span className="text-sm text-white">{new Date(row.created_at).toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>User:</strong>{" "}
                          {row.conversation?.messages?.find((m) => m.role === "user")?.content || ""}
                        </p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Bot:</strong>{" "}
                          {row.conversation?.messages?.find((m) => m.role === "assistant")?.content || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setChatPreview(row)}>
                        View Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const res = await fetch(`/api/admin/chatbot/conversations/${row.id}`, { method: "DELETE" })
                          if (res.ok) {
                            setConversations((prev) => prev.filter((c) => c.id !== row.id))
                            toast({ title: "Deleted", description: "Conversation removed." })
                          } else {
                            toast({ title: "Delete failed", description: "Could not remove conversation.", variant: "destructive" })
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Dialog open={!!chatPreview} onOpenChange={(o) => !o && setChatPreview(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Full Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {chatPreview?.conversation?.messages?.map((m, idx) => (
                  <div key={idx} className={m.role === "user" ? "bg-muted p-3 rounded" : "bg-primary/10 p-3 rounded"}>
                    <p className="text-xs opacity-70">{m.role.toUpperCase()}</p>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
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
                  <p className="text-sm text-white">Turn the chatbot on or off</p>
                </div>
                <Switch
                  checked={settings?.status === "enabled"}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...(s || { welcome_message: "", system_prompt: "", provider: "openrouter" }), status: checked ? "enabled" : "disabled" }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea
                  placeholder="Enter the welcome message for new users..."
                  value={settings?.welcome_message || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...(s || { status: "disabled", system_prompt: "", provider: "openrouter" }), welcome_message: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  placeholder="Strict KUCCPS-only instructions and refusal rules..."
                  value={settings?.system_prompt || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...(s || { status: "disabled", welcome_message: "", provider: "openrouter" }), system_prompt: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>AI Provider</Label>
                {/* Use styled Select component */}
                <>
                  {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                </>
                {/* @ts-expect-error Server Components classnames */}
                {(() => {
                  const ProviderSelect = require("@/components/ui/select")
                  const S = ProviderSelect
                  return (
                    <S.Select
                      value={settings?.provider || "openrouter"}
                      onValueChange={(val: string) =>
                        setSettings((s) => ({ ...(s || { status: "disabled", welcome_message: "", system_prompt: "" }), provider: val }))
                      }
                    >
                      <S.SelectTrigger className="w-full">
                        <S.SelectValue placeholder="Select provider" />
                      </S.SelectTrigger>
                      <S.SelectContent>
                        <S.SelectItem value="openrouter">OpenRouter</S.SelectItem>
                        <S.SelectItem value="openai">OpenAI</S.SelectItem>
                        <S.SelectItem value="gemini">Gemini</S.SelectItem>
                        <S.SelectItem value="qwen">Qwen</S.SelectItem>
                      </S.SelectContent>
                    </S.Select>
                  )
                })()}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <Label>Provider API Key</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your provider API key"
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Data tab removed */}
      </Tabs>
    </div>
  )
}
