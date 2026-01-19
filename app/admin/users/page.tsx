"use client"

import { useEffect, useMemo, useState } from "react"
import { Users, Search, Filter, MoreHorizontal, Mail, Phone, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [todayCount, setTodayCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSuspending, setIsSuspending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const params = useMemo(() => {
    const p = new URLSearchParams()
    p.set("page", String(page))
    p.set("pageSize", String(pageSize))
    if (searchTerm) p.set("q", searchTerm)
    if (status && status !== "all") p.set("status", status)
    if (from) p.set("from", from)
    if (to) p.set("to", to)
    return p.toString()
  }, [page, pageSize, searchTerm, status, from, to])

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/users?${params}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load users")
      const json = await res.json()
      setUsers(json.items || [])
      setTodayCount(json.today || 0)
      setTotalCount(json.total || 0)
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load users", variant: "destructive" })
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers()
  }, [params])

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete user")
      toast({ title: "Success", description: "User deleted successfully", variant: "success" })
      loadUsers()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusUpdate = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "banned" : "active"
    const action = currentStatus === "active" ? "suspend" : "activate"
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      setIsSuspending(true)
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error(`Failed to ${action} user`)
      toast({ title: "Success", description: `User ${newStatus === "active" ? "activated" : "suspended"} successfully`, variant: "success" })
      loadUsers()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setIsSuspending(false)
    }
  }

  const handleMessage = (phoneNumber: string) => {
    if (!phoneNumber) {
      toast({ title: "No Phone Number", description: "This user does not have a phone number provided.", variant: "destructive" })
      return
    }
    // Format phone number: remove non-digits
    const formatted = phoneNumber.replace(/\D/g, "")
    // Ensure it starts with a country code if it doesn't (assuming Kenya +254 as default based on project context)
    const tel = formatted.startsWith("254") || formatted.startsWith("0") ?
      (formatted.startsWith("0") ? "254" + formatted.substring(1) : formatted) :
      formatted;

    window.open(`https://wa.me/${tel}`, "_blank")
  }

  const handleViewDetails = (user: any) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  if (!isMounted) return (
    <div className="flex items-center justify-center min-h-screen p-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-white/70">Manage and monitor platform users</p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={async () => {
            try {
              toast({ title: "Exporting...", description: "Preparing CSV file." })
              const exportParams = new URLSearchParams(params.toString())
              exportParams.delete("page")
              exportParams.set("pageSize", "10000") // Fetch up to 10k users for export

              const res = await fetch(`/api/admin/users?${exportParams.toString()}`)
              if (!res.ok) throw new Error("Failed to fetch data")

              const json = await res.json()
              const allUsers = json.items || []

              if (allUsers.length === 0) {
                toast({ title: "No Data", description: "No users found to export", variant: "destructive" })
                return
              }

              const header = ["Name", "Email", "Phone", "Status", "Joined"]
              const rows = allUsers.map((u: any) => [
                `"${u.name || ""}"`,
                `"${u.email || ""}"`,
                `"${u.phone_number || ""}"`,
                `"${u.status || ""}"`,
                `"${new Date(u.created_at).toLocaleString()}"`
              ])
              const csv = [header.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n")
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `users_export_${Date.now()}.csv`
              a.click()
              URL.revokeObjectURL(url)

              toast({ title: "Export Successful", description: `Exported ${allUsers.length} users.`, variant: "success" })
            } catch (e) {
              toast({ title: "Export Failed", description: "Could not generate CSV.", variant: "destructive" })
            }
          }}>
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today’s Users</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-white">New users created today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-white">All users in the system</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all registered users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col lg:grid lg:grid-cols-6 gap-3 mb-6">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
            <Select value={String(pageSize)} onValueChange={(v) => { setPage(1); setPageSize(Number(v)); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / pg</SelectItem>
                <SelectItem value="25">25 / pg</SelectItem>
                <SelectItem value="50">50 / pg</SelectItem>
                <SelectItem value="100">100 / pg</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${user.email || user.name}`} />
                            <AvatarFallback>
                              {(user.name || "U")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || "Anonymous"}</p>
                            <p className="text-xs text-white/70">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-white/50" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Phone className="h-3 w-3 text-white/50" />
                            {user.phone_number || "No phone"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-white/50" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMessage(user.phone_number)}>Send Message</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, user.status)}>
                              {user.status === "active" ? "Suspend User" : "Activate User"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>Delete User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-white/70 text-center sm:text-left">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">&lt;</span>
              </Button>
              <div className="text-xs sm:text-sm font-medium px-2 whitespace-nowrap">
                Page {page} of {Math.ceil(totalCount / pageSize)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalCount || isLoading}
                className="h-8 w-8 p-0 sm:w-auto sm:px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">&gt;</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-slate-950 text-white border-slate-800 p-0 overflow-hidden ring-offset-slate-950">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex flex-col items-center gap-3">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarImage src={`https://avatar.vercel.sh/${selectedUser?.email || "user"}`} />
              <AvatarFallback className="text-2xl bg-slate-800">
                {selectedUser?.name?.split(" ").map((n: any) => n[0]).join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <DialogTitle className="text-xl font-bold">{selectedUser?.name || "User Profile"}</DialogTitle>
              <p className="text-blue-100 text-sm">{selectedUser?.email}</p>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-slate-400">Phone Number</div>
                <div className="text-right font-medium">{selectedUser?.phone_number || "Not provided"}</div>

                <div className="text-slate-400">Status</div>
                <div className="text-right">
                  <Badge variant={selectedUser?.status === "active" ? "default" : "secondary"}>
                    {selectedUser?.status}
                  </Badge>
                </div>

                <div className="border-t border-slate-800 col-span-2 my-1" />

                <div className="text-slate-400">Joined Date</div>
                <div className="text-right">{selectedUser ? new Date(selectedUser.created_at).toLocaleDateString() : "-"}</div>

                <div className="text-slate-400">Course Category</div>
                <div className="text-right capitalize">{selectedUser?.course_category || "N/A"}</div>

                <div className="text-slate-400">Referred By</div>
                <div className="text-right text-yellow-500 font-medium">{selectedUser?.agent || "direct"}</div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() => handleMessage(selectedUser?.phone_number)}
              >
                Chat on WhatsApp
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="bg-slate-900 border-slate-700 hover:bg-slate-800"
                  onClick={() => handleStatusUpdate(selectedUser?.id, selectedUser?.status)}
                >
                  {selectedUser?.status === "active" ? "Suspend" : "Activate"}
                </Button>
                <Button
                  variant="destructive"
                  className="font-medium"
                  onClick={() => handleDelete(selectedUser?.id)}
                >
                  Delete User
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
            <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

