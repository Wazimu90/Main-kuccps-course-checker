"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Eye, Edit, RotateCcw } from "lucide-react"

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

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editCode, setEditCode] = useState("")
  const [editLink, setEditLink] = useState("")

  // View Details modal state
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null)

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)
    const existing = m ? decodeURIComponent(m[1]) : ""
    const token = existing || Math.random().toString(36).slice(2)
    if (!existing) {
      document.cookie = `csrf_token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60}`
    }
    setCsrf(token)
  }, [])

  const loadAgents = useCallback(async () => {
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
  }, [q, toast])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  const onAdd = async () => {
    try {
      setLoading(true)
      if (!csrf) {
        throw new Error("Missing CSRF token. Please reload and try again.")
      }
      if (!name.trim() || !phone.trim()) {
        throw new Error("Please provide both name and phone number")
      }
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ name: name.trim(), phone_number: phone.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to add agent")
      setName("")
      setPhone("")
      await loadAgents()
      toast({ title: "✅ Agent added", description: `${json.agent.name} has been added successfully` })
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
      toast({ title: "Agent removed", description: `Removed successfully` })
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
        description: `${agent.name} is now ${nextStatus}`,
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

  // Open edit modal
  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent)
    setEditName(agent.name)
    setEditPhone(agent.phone_number || "")
    setEditCode(agent.code)
    setEditLink(agent.link || "")
    setEditModalOpen(true)
  }

  // Save edited agent
  const saveEdit = async () => {
    if (!editingAgent) return
    try {
      setLoading(true)
      if (!csrf) {
        throw new Error("Missing CSRF token. Please reload and try again.")
      }
      const res = await fetch(`/api/admin/referrals/${editingAgent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({
          name: editName.trim(),
          phone_number: editPhone.trim(),
          code: editCode.trim(),
          link: editLink.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update agent")
      await loadAgents()
      setEditModalOpen(false)
      toast({ title: "✅ Agent updated", description: `${editName} has been updated successfully` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to update agent", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Reset referral count
  const resetCount = async (agent: Agent) => {
    try {
      // Read CSRF token fresh from cookie each time
      const cookieMatch = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)
      const csrfToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : ""

      console.log("=== CSRF DEBUG - Reset Count ===")
      console.log("Cookie value:", csrfToken || "NOT FOUND")
      console.log("Cookie length:", csrfToken.length)
      console.log("Sending as header:", csrfToken)
      console.log("================================")

      if (!csrfToken) {
        throw new Error("Missing CSRF token. Please reload the page.")
      }

      const res = await fetch(`/api/admin/referrals/${agent.id}/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken  // Use fresh token from cookie
        },
      })
      const json = await res.json()

      if (!res.ok) {
        console.error("Reset failed:", json)
        throw new Error(json.details || json.error || "Failed to reset count")
      }

      await loadAgents()
      toast({ title: "✅ Count reset", description: `${agent.name}'s referral count has been reset to zero` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to reset count", variant: "destructive" })
    }
  }

  // Open view details modal with commission calculator
  const openViewModal = (agent: Agent) => {
    setViewingAgent(agent)
    setViewModalOpen(true)
  }

  // Calculate commission
  const calculateCommission = (agent: Agent) => {
    const PAYMENT_AMOUNT = 200 // KSH 200 per user
    // Special commission for Gwiji Fleva
    const isGwijiFleva = agent.name === "Gwiji Fleva" && agent.phone_number === "0763021579"
    const commissionRate = isGwijiFleva ? 0.70 : 0.30 // 70% for Gwiji, 30% for others

    const totalRevenue = agent.total * PAYMENT_AMOUNT
    const commission = totalRevenue * commissionRate

    return {
      totalRevenue,
      commission,
      commissionRate: commissionRate * 100,
      isSpecialRate: isGwijiFleva
    }
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
            <Button onClick={onAdd} disabled={loading || !name.trim() || !phone.trim()}>
              {loading ? "Adding..." : "Add Agent"}
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
                <TableHead>Actions</TableHead>
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
                  <TableCell className="max-w-[200px] truncate">
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
                        <DropdownMenuItem onClick={() => openViewModal(a)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(a)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resetCount(a)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset Count
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleSuspend(a)}>
                          {a.status === "disabled" ? "Unsuspend" : "Suspend"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const link = a.link || `/rc=${a.code}`
                          window.open(link.startsWith("http") ? link : window.location.origin + link, "_blank")
                        }}>
                          Visit Link
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

      {/* Edit Agent Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent Details</DialogTitle>
            <DialogDescription>
              Update the agent's information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Agent name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-code">Referral Code</Label>
              <Input
                id="edit-code"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                placeholder="Referral code"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-link">Referral Link</Label>
              <Input
                id="edit-link"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="Custom link (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={loading || !editName.trim()}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal with Commission Calculator */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Agent Details & Commission</DialogTitle>
            <DialogDescription>
              Complete overview of agent performance and earnings
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-1">
            {viewingAgent && (
              <div className="space-y-6 py-4">
                {/* Agent Summary */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h3 className="font-semibold mb-3 text-lg">Agent Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{viewingAgent.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{viewingAgent.phone_number || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Referral Code</p>
                      <p className="font-medium font-mono">{viewingAgent.code}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{viewingAgent.status || "active"}</p>
                    </div>
                  </div>
                </div>

                {/* Referral Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Today's Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{viewingAgent.today}</div>
                      <p className="text-xs text-muted-foreground mt-1">users referred today</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{viewingAgent.total}</div>
                      <p className="text-xs text-muted-foreground mt-1">all-time referrals</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Commission Calculator */}
                <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                  <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                    💰 Commission Calculator
                    {calculateCommission(viewingAgent).isSpecialRate && (
                      <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">Premium Rate</span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Referrals</span>
                      <span className="font-medium">{viewingAgent.total} users</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Payment per User</span>
                      <span className="font-medium">KSH 200</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Revenue Generated</span>
                      <span className="font-medium">KSH {calculateCommission(viewingAgent).totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Commission Rate</span>
                      <span className="font-semibold text-primary">
                        {calculateCommission(viewingAgent).commissionRate}%
                        {calculateCommission(viewingAgent).isSpecialRate && " ⭐"}
                      </span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Total Commission</span>
                        <span className="text-2xl font-bold text-green-600">
                          KSH {calculateCommission(viewingAgent).commission.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {calculateCommission(viewingAgent).isSpecialRate && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-800">
                          ⭐ This agent has a premium commission rate of 70% (vs standard 30%)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
