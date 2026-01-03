"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Eye, Edit, Trash2, Plus, Search, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import RichTextEditor from "@/components/admin/rich-text-editor"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type NewsItem = {
  id: string
  title: string
  slug: string
  category: string | null
  tags: string[] | null
  status?: string | null
  thumbnail_url: string | null
  content: string
  created_at: string
  updated_at: string | null
  likes_count: number | null
  comments_count: number | null
}

export default function AdminNewsPage() {
  const { toast } = useToast()
  const [summary, setSummary] = useState<{ totalPosts: number; publishedPosts: number; expertUses: number; engagement: { likes: number; comments: number; views: number } } | null>(null)
  const [items, setItems] = useState<NewsItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)
  const [settings, setSettings] = useState<{ api_key: string | null; system_prompt: string; news_access_enabled: boolean } | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [logsPage, setLogsPage] = useState(1)
  const [logsTotal, setLogsTotal] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<NewsItem | null>(null)
  const [form, setForm] = useState<{ title: string; slug: string; category: string; content: string; thumbnail_url?: string; tags?: string[]; status?: string }>({
    title: "",
    slug: "",
    category: "",
    content: "",
    thumbnail_url: "",
    tags: [],
    status: "draft",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadSummary = async () => {
      const res = await fetch("/api/admin/news/summary", { cache: "no-store" })
      const data = await res.json()
      setSummary(data)
    }
    const loadItems = async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.set("q", searchTerm)
      const res = await fetch(`/api/admin/news?${params.toString()}`, { cache: "no-store" })
      const data = await res.json()
      setItems(data.items || [])
    }
    const loadSettings = async () => {
      const res = await fetch("/api/admin/news/assistant/settings", { cache: "no-store" })
      const data = await res.json()
      setSettings(data.settings || { api_key: null, system_prompt: "", news_access_enabled: false })
    }
    const loadLogs = async (page = 1, opts?: { q?: string; used?: string; sort?: string; pageSize?: number }) => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(opts?.pageSize ?? 10) })
      if (opts?.q) params.set("q", opts.q)
      if (opts?.used) params.set("used", opts.used)
      if (opts?.sort) params.set("sort", opts.sort)
      const res = await fetch(`/api/admin/news/assistant/chats?${params.toString()}`, { cache: "no-store" })
      const data = await res.json()
      setLogs(data.items || [])
      setLogsTotal(data.total || 0)
      setLogsPage(page)
    }
    loadSummary()
    loadItems()
    loadSettings()
    loadLogs(1)

    const channel = supabase
      .channel("news-assistant")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news_assistant_chats" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLogs((prev) => [payload.new as any, ...prev].slice(0, prev.length))
            setLogsTotal((t) => t + 1)
          } else if (payload.eventType === "UPDATE") {
            setLogs((prev) => prev.map((l) => (l.id === (payload.new as any).id ? (payload.new as any) : l)))
          } else if (payload.eventType === "DELETE") {
            setLogs((prev) => prev.filter((l) => l.id !== (payload.old as any).id))
            setLogsTotal((t) => Math.max(0, t - 1))
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news_assistant_settings" },
        () => {
          fetch("/api/admin/news/assistant/settings")
            .then((r) => r.json())
            .then((s) => setSettings(s.settings || settings))
            .catch(() => {})
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News</h1>
          <p className="text-white">Manage KUCCPS news posts and the expert assistant</p>
        </div>
        <Button
          onClick={() => {
            setForm({
              title: "",
              slug: "",
              category: "",
              content: "",
              thumbnail_url: "",
              tags: [],
              status: "draft",
            })
            setIsCreateOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BookOpen className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalPosts ?? 0}</div>
            <p className="text-xs text-white">Latest count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.publishedPosts ?? 0}</div>
            <p className="text-xs text-white">Tagged as published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KUCCPS Expert Uses</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.expertUses ?? 0}</div>
            <p className="text-xs text-white">Assistant conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Engagement</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(summary?.engagement?.likes ?? 0) + (summary?.engagement?.comments ?? 0)}
            </div>
            <p className="text-xs text-white">
              {summary
                ? `Likes ${summary?.engagement?.likes ?? 0} • Comments ${summary?.engagement?.comments ?? 0} • Views ${summary?.engagement?.views ?? 0}`
                : "Loading…"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="management">News Management</TabsTrigger>
          <TabsTrigger value="assistant">KUCCPS Expert Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle>All News</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-white truncate max-w-xs">{item.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category || "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(item.status || (item.tags || []).includes("published")) ? "default" : "secondary"}>
                            {item.status ? item.status : ( (item.tags || []).includes("published") ? "published" : "draft" )}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.likes_count ?? 0}</TableCell>
                        <TableCell>{item.comments_count ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentItem(item)
                                  setForm({
                                    title: item.title,
                                    slug: item.slug,
                                    category: item.category || "",
                                    content: item.content,
                                    thumbnail_url: item.thumbnail_url || "",
                                    tags: item.tags || [],
                                    status: item.status || ((item.tags || []).includes("published") ? "published" : "draft"),
                                  })
                                  setIsEditOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Post
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  const res = await fetch(`/api/admin/news/${item.id}/publish?action=${(item.tags || []).includes("published") ? "unpublish" : "publish"}`, { method: "POST" })
                                  if (res.ok) {
                                    const next = await res.json()
                                    setItems((prev) =>
                                      prev.map((n) => (n.id === item.id ? { ...n, tags: next.tags } : n)),
                                    )
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {(item.tags || []).includes("published") ? "Unpublish" : "Publish"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentItem(item)
                                  setIsViewOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Post
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setCurrentItem(item)
                                  setIsDeleteOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant">
          <Card>
            <CardHeader>
              <CardTitle>KUCCPS Expert Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Settings</h2>
                  <div className="space-y-2">
                    <label className="text-sm">API Key</label>
                    <Input
                      type="password"
                      value={settings?.api_key || ""}
                      onChange={(e) => setSettings((s) => (s ? { ...s, api_key: e.target.value } : s))}
                      placeholder="Enter API key"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">System Prompt</label>
                    <Input
                      value={settings?.system_prompt || ""}
                      onChange={(e) => setSettings((s) => (s ? { ...s, system_prompt: e.target.value } : s))}
                      placeholder="Enter system prompt"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">News Access Enabled</span>
                    <Button
                      variant={settings?.news_access_enabled ? "default" : "secondary"}
                      onClick={() =>
                        setSettings((s) =>
                          s ? { ...s, news_access_enabled: !s.news_access_enabled } : s,
                        )
                      }
                    >
                      {settings?.news_access_enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <Button
                    onClick={async () => {
                      setSavingSettings(true)
                      const res = await fetch("/api/admin/news/assistant/settings", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(settings),
                      })
                      setSavingSettings(false)
                      if (res.ok) {
                        const data = await res.json()
                        if (data.ok) {
                          const refreshed = await fetch("/api/admin/news/assistant/settings")
                          const s = await refreshed.json()
                          setSettings(s.settings || settings)
                        }
                      }
                    }}
                  >
                    {savingSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Chat Logs</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      aria-label="Search chats"
                      placeholder="Search chats..."
                      onChange={(e) => {
                        const q = e.target.value
                        fetch(`/api/admin/news/assistant/chats?page=1&pageSize=10&q=${encodeURIComponent(q)}`)
                          .then((r) => r.json())
                          .then((d) => {
                            setLogs(d.items || [])
                            setLogsTotal(d.total || 0)
                            setLogsPage(1)
                          })
                      }}
                    />
                    <select
                      aria-label="Filter by used news context"
                      className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
                      onChange={(e) => {
                        const used = e.target.value
                        fetch(`/api/admin/news/assistant/chats?page=1&pageSize=10&used=${used}`)
                          .then((r) => r.json())
                          .then((d) => {
                            setLogs(d.items || [])
                            setLogsTotal(d.total || 0)
                            setLogsPage(1)
                          })
                      }}
                    >
                      <option value="">All</option>
                      <option value="true">Used News</option>
                      <option value="false">Did Not Use</option>
                    </select>
                    <select
                      aria-label="Sort by date"
                      className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
                      onChange={(e) => {
                        const sort = e.target.value
                        fetch(`/api/admin/news/assistant/chats?page=1&pageSize=10&sort=${sort}`)
                          .then((r) => r.json())
                          .then((d) => {
                            setLogs(d.items || [])
                            setLogsTotal(d.total || 0)
                            setLogsPage(1)
                          })
                      }}
                    >
                      <option value="desc">Newest</option>
                      <option value="asc">Oldest</option>
                    </select>
                    <Button
                      aria-label="Export chat logs as CSV"
                      variant="secondary"
                      onClick={() => {
                        const header = [
                          "id",
                          "user_ip",
                          "user_email",
                          "user_phone",
                          "user_message",
                          "assistant_response",
                          "used_news_context",
                          "created_at",
                        ]
                        const rows = logs.map((l) =>
                          header
                            .map((h) => {
                              const v = (l as any)[h]
                              const s = v === null || v === undefined ? "" : String(v).replace(/"/g, '""')
                              return `"${s}"`
                            })
                            .join(","),
                        )
                        const csv = [header.join(","), ...rows].join("\n")
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `news_assistant_chats_${Date.now()}.csv`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      aria-label="Export chat logs as JSON"
                      variant="secondary"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `news_assistant_chats_${Date.now()}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead scope="col">ID</TableHead>
                          <TableHead scope="col">User</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Response</TableHead>
                          <TableHead>Used News</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell>{l.id}</TableCell>
                            <TableCell>{l.user_email || l.user_phone || "—"}</TableCell>
                            <TableCell>{l.user_ip || "—"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{l.user_message}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{l.assistant_response}</TableCell>
                            <TableCell>
                              <Badge variant={l.used_news_context ? "default" : "secondary"}>
                                {l.used_news_context ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                aria-label="Delete chat row"
                                variant="ghost"
                                onClick={async () => {
                                  const ok = window.confirm("Delete this chat record?")
                                  if (!ok) return
                                  const res = await fetch(`/api/admin/news/assistant/chats/${l.id}`, { method: "DELETE" })
                                  if (res.ok) {
                                    toast({ title: "Deleted", description: "Chat record deleted" })
                                    fetch(`/api/admin/news/assistant/chats?page=${logsPage}&pageSize=10`)
                                      .then((r) => r.json())
                                      .then((d) => {
                                        setLogs(d.items || [])
                                        setLogsTotal(d.total || 0)
                                      })
                                  } else {
                                    toast({ title: "Error", description: "Failed to delete chat", variant: "destructive" })
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total: {logsTotal}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const prev = Math.max(1, logsPage - 1)
                          fetch(`/api/admin/news/assistant/chats?page=${prev}&pageSize=10`)
                            .then((r) => r.json())
                            .then((d) => {
                              setLogs(d.items || [])
                              setLogsTotal(d.total || 0)
                              setLogsPage(prev)
                            })
                        }}
                        aria-label="Previous page"
                      >
                        Prev
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const next = logsPage + 1
                          fetch(`/api/admin/news/assistant/chats?page=${next}&pageSize=10`)
                            .then((r) => r.json())
                            .then((d) => {
                              setLogs(d.items || [])
                              setLogsTotal(d.total || 0)
                              setLogsPage(next)
                            })
                        }}
                        aria-label="Next page"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                  slug:
                    form.slug ||
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
                })
              }
              aria-label="Post title"
            />
            <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} aria-label="Post slug" />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} aria-label="Post category" />
            <Input placeholder="Thumbnail URL" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} aria-label="Thumbnail URL" />
            <div className="flex items-center gap-2">
              <label htmlFor="status" className="text-sm">
                Status
              </label>
              <select
                id="status"
                aria-label="Post status"
                className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
                value={form.status || "draft"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!form.title || !form.slug || !form.category || !form.content) {
                  toast({ title: "Missing fields", description: "Title, slug, category and content are required", variant: "destructive" })
                  return
                }
                try {
                  setIsSubmitting(true)
                  const res = await fetch("/api/admin/news", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  })
                  setIsSubmitting(false)
                  if (res.ok) {
                    toast({ title: "Created", description: "Post has been saved" })
                    setIsCreateOpen(false)
                    const list = await fetch("/api/admin/news").then((r) => r.json())
                    setItems(list.items || [])
                    const sum = await fetch("/api/admin/news/summary").then((r) => r.json())
                    setSummary(sum)
                  } else {
                    const err = await res.json().catch(() => ({} as any))
                    toast({ title: "Error", description: err.error || "Failed to create post", variant: "destructive" })
                  }
                } catch {
                  setIsSubmitting(false)
                  toast({ title: "Network error", description: "Could not reach server", variant: "destructive" })
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input placeholder="Thumbnail URL" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
            <div className="flex items-center gap-2">
              <label htmlFor="edit-status" className="text-sm">
                Status
              </label>
              <select
                id="edit-status"
                aria-label="Post status"
                className="h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
                value={form.status || "draft"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!currentItem) return
                try {
                  setIsSubmitting(true)
                  const res = await fetch(`/api/admin/news/${currentItem.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  })
                  setIsSubmitting(false)
                  if (res.ok) {
                    toast({ title: "Updated", description: "Post changes saved" })
                    setIsEditOpen(false)
                    const list = await fetch("/api/admin/news").then((r) => r.json())
                    setItems(list.items || [])
                    const sum = await fetch("/api/admin/news/summary").then((r) => r.json())
                    setSummary(sum)
                  } else {
                    const err = await res.json().catch(() => ({} as any))
                    toast({ title: "Error", description: err.error || "Failed to update post", variant: "destructive" })
                  }
                } catch {
                  setIsSubmitting(false)
                  toast({ title: "Network error", description: "Could not reach server", variant: "destructive" })
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[65vh] overflow-y-auto">
            <div className="font-semibold">{currentItem?.title}</div>
            <div className="text-sm text-white">{currentItem?.category}</div>
            <div dangerouslySetInnerHTML={{ __html: currentItem?.content || "" }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white">Are you sure you want to delete “{currentItem?.title}”?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="text-red-600"
              onClick={async () => {
                if (!currentItem) return
                const res = await fetch(`/api/admin/news/${currentItem.id}`, { method: "DELETE" })
                if (res.ok) {
                  setIsDeleteOpen(false)
                  const list = await fetch("/api/admin/news").then((r) => r.json())
                  setItems(list.items || [])
                  const sum = await fetch("/api/admin/news/summary").then((r) => r.json())
                  setSummary(sum)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
