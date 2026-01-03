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

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [todayCount, setTodayCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

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
      const res = await fetch(`/api/admin/users?${params}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load users")
      const json = await res.json()
      setUsers(json.items || [])
      setTodayCount(json.today || 0)
      setTotalCount(json.total || 0)
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load users", variant: "destructive" })
    }
  }

  useEffect(() => {
    loadUsers()
  }, [params])

  const filteredUsers = users

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-white">Manage and monitor platform users</p>
        </div>
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
          <div className="grid gap-2 md:grid-cols-5 mb-6">
            <div className="relative md:col-span-2">
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
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
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
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${user.email || user.name}`} />
                          <AvatarFallback>
                            {(user.name || "")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-white">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white">
                          <Phone className="h-3 w-3" />
                          {user.phone_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem>Suspend User</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
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
    </div>
  )
}
