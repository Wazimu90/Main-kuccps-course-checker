"use client"

import { useState, useEffect } from "react"
import { Bell, Flag, User, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminTopBar() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState(new Date())

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Update last sync time every minute
    const interval = setInterval(() => {
      setLastSync(new Date())
    }, 60000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  const formatLastSync = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes === 1) return "1 min ago"
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours === 1) return "1 hour ago"
    return `${diffInHours} hours ago`
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Hi, Welcome back</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span>Offline</span>
            </>
          )}
          <span>•</span>
          <span>Last synced {formatLastSync(lastSync)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Flag */}
        <Button variant="ghost" size="icon">
          <Flag className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            2
          </Badge>
        </Button>

        {/* User Profile */}
        <Link href="/">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>

        {/* Admin Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Change Password</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Version Info */}
        <div className="hidden text-xs text-muted-foreground md:block">v1.0.0</div>
      </div>
    </header>
  )
}
