"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

type Activity = { id: number; type: "admin" | "user" | "news"; action: string; user: string; timestamp: string }

export default function ActivityLog() {
  const { toast } = useToast()
  const [items, setItems] = useState<Activity[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [type, setType] = useState<string>("all")
  const [q, setQ] = useState("")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    p.set("page", String(page))
    p.set("pageSize", String(pageSize))
    if (type) p.set("type", type)
    if (q) p.set("q", q)
    if (from) p.set("from", from)
    if (to) p.set("to", to)
    return p.toString()
  }, [page, pageSize, type, q, from, to])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/activity?${params}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load activity data")
      const json = await res.json()
      setItems(
        json.data.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp).toLocaleString(),
        })),
      )
      setTotal(json.total)
    } catch (e: any) {
      setError(e.message || "Unknown error")
      toast({ title: "Error", description: "Failed to load activity data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('activity_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          // Reload data when any change happens to stay in sync
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-5">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="md:col-span-1">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="news">News</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="md:col-span-2"
            aria-label="Search activities"
          />
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[160px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-white">{error}</div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Badge variant={item.type === "admin" ? "default" : item.type === "user" ? "secondary" : "outline"}>
                    {item.type.toUpperCase()}
                  </Badge>
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-light">{item.action}</div>
                    <div className="text-xs text-white">
                      {item.user} • {item.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-white">
            Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => (p * pageSize < total ? p + 1 : p))}
              disabled={page * pageSize >= total}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
