"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

type Agent = {
  id: string
  name: string
  code: string
  today: number
  total: number
  link?: string
  phone_number?: string
  status?: "active" | "disabled"
}

export default function ReferralsPage() {
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [csrf, setCsrf] = useState("")

  const getCsrf = () => {
    return csrf
  }

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)
    const existing = m ? decodeURIComponent(m[1]) : ""
    const token = existing || Math.random().toString(36).slice(2)
    if (!existing) {
      document.cookie = `csrf_token=${token}; path=/; max-age=${60 * 60}`
    }
    setCsrf(token)
  }, [])

  const loadAgents = async () => {
    try {
      const url = new URL("/api/admin/referrals", window.location.origin)
      if (q) url.searchParams.set("q", q)
      const res = await fetch(url.toString(), { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load referrals")
      const json = await res.json()
      setAgents(json.agents || [])
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load referrals", variant: "destructive" })
    }
  }

  useEffect(() => {
    loadAgents()
  }, [q])

  const onAdd = async () => {
    try {
      setLoading(true)
      if (!csrf) {
        throw new Error("Missing CSRF token. Please reload and try again.")
      }
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ name, phone_number: phone }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to add agent")
      setName("")
      setPhone("")
      await loadAgents()
      toast({ title: "Agent added", description: `${json.agent.name} added` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to add agent", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const onRemove = async (id: string) => {
    try {
      if (!csrf) {
        throw new Error("Missing CSRF token. Please reload and try again.")
      }
      const res = await fetch(`/api/admin/referrals/${id}`, { method: "DELETE", headers: { "x-csrf-token": csrf } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to remove agent")
      await loadAgents()
      toast({ title: "Agent removed", description: `Removed ${id}` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to remove agent", variant: "destructive" })
    }
  }

  const onToggleSuspend = async (agent: Agent) => {
    try {
      const nextStatus = agent.status === "disabled" ? "active" : "disabled"
      if (!csrf) {
        throw new Error("Missing CSRF token. Please reload and try again.")
      }
      const res = await fetch(`/api/admin/referrals/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ status: nextStatus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Failed to set status to ${nextStatus}`)
      await loadAgents()
      toast({
        title: nextStatus === "disabled" ? "Agent suspended" : "Agent reactivated",
        description: `${agent.id} is now ${nextStatus}`,
      })
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to update agent status", variant: "destructive" })
    }
  }

  const onContact = (phone?: string) => {
    if (!phone) {
      toast({ title: "No phone number", description: "This agent has no phone number on record", variant: "destructive" })
      return
    }
    const tel = `tel:${String(phone).replace(/\s+/g, "")}`
    window.open(tel)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Referral Agents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Agent phone number" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or code" />
            <Button onClick={onAdd} disabled={loading || !name || !phone}>
              Add Agent
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Today</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Referral Link</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.code}</TableCell>
                  <TableCell>{a.phone_number || "-"}</TableCell>
                  <TableCell>{a.today}</TableCell>
                  <TableCell>{a.total}</TableCell>
                  <TableCell>
                    {a.link || `/rc=${a.code}`}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onToggleSuspend(a)}>
                          {a.status === "disabled" ? "Unsuspend" : "Suspend"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const link = a.link || `/rc=${a.code}`
                          window.open(link.startsWith("http") ? link : window.location.origin + link, "_blank")
                        }}>
                          Visit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onContact(a.phone_number)}>Contact</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => onRemove(a.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
