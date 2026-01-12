"use client"

import { useState, useEffect } from "react"
import { Users, TrendingUp, CreditCard, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import RevenueChart from "@/components/admin/revenue-chart"
import ActivityLog from "@/components/admin/activity-log"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabase"

// Tabs and legacy analytics sections removed

export default function AdminDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<{
    revenue: { today: number; total: number }
    users: { today: number; total: number }
    news: { total: number; likes: number }
    referrals: { agents: Array<{ id: string; name: string; code: string; today: number; total: number }> }
  }>({
    revenue: { today: 0, total: 0 },
    users: { today: 0, total: 0 },
    news: { total: 0, likes: 0 },
    referrals: { agents: [] },
  })
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalInstitutions: 0,
    successRate: 0,
    recentUsers: [],
    systemAlerts: [],
    recentActivity: [],
  })

  // Initialize stats with default values


  // Load dashboard data
  useEffect(() => {
    // Load metrics function
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/admin/metrics", { cache: "no-store" })
        if (res.ok) {
          const json = await res.json()
          setMetrics(json)
        }
      } catch (error) {
        console.error("Error fetching metrics:", error)
      }
    }

    const loadDashboardData = async () => {
      try {
        // ... existing dummy data setup ...
        const newDashboardData = {
          totalUsers: 1247,
          totalCourses: 8934,
          totalInstitutions: 156,
          successRate: 87.3,
          recentUsers: [],
          systemAlerts: [],
          recentActivity: [], // ActivityLog component handles this
        }
        setDashboardData(newDashboardData)

        // Fetch initial metrics
        await fetchMetrics()
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    loadDashboardData()

    // Subscribe to realtime updates for metrics tables
    const channel = supabase
      .channel('admin_dashboard_metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_transactions' },
        () => fetchMetrics()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news' },
        () => fetchMetrics()
      )
      .subscribe()

    // Keep a slower polling interval as fallback and for non-subscribed data (like auth users)
    const id = setInterval(fetchMetrics, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(id)
    }
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-white">Monitor and manage your KUCCPS Course Checker platform</p>
        </div>
      </div>

      {/* KPI Cards */}
      <TooltipProvider>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Revenue</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-green-700">Today</div>
                  <div className="text-xl font-bold text-green-900">
                    {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(metrics.revenue.today)}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-green-700" />
                  </TooltipTrigger>
                  <TooltipContent>Revenue generated today</TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-green-700">Total</div>
                  <div className="text-xl font-bold text-green-900">
                    {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(metrics.revenue.total)}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-green-700" />
                  </TooltipTrigger>
                  <TooltipContent>Cumulative revenue to date</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Referrals</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.referrals.agents.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-900">
                      {a.name} ({a.code.toUpperCase()})
                    </div>
                    <div className="text-xs text-blue-700">
                      Today: {a.today} • Total: {a.total}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Users</CardTitle>
              <div className="h-8 w-8 rounded-full bg-yellow-200 flex items-center justify-center">
                <Users className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-yellow-700">Today</div>
                  <div className="text-xl font-bold text-yellow-900">{metrics.users.today}</div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-yellow-700" />
                  </TooltipTrigger>
                  <TooltipContent>Users registered today</TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-yellow-700">Total</div>
                  <div className="text-xl font-bold text-yellow-900">{metrics.users.total}</div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-yellow-700" />
                  </TooltipTrigger>
                  <TooltipContent>Total registered users</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">News</CardTitle>
              <div className="h-8 w-8 rounded-full bg-orange-200 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-orange-700">Total Posts</div>
                  <div className="text-xl font-bold text-orange-900">{metrics.news.total}</div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-orange-700" />
                  </TooltipTrigger>
                  <TooltipContent>Total news posts</TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-orange-700">Total Likes</div>
                  <div className="text-xl font-bold text-orange-900">{metrics.news.likes}</div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-orange-700" />
                  </TooltipTrigger>
                  <TooltipContent>Aggregate likes across news</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>

      {/* Revenue Trends */}
      <RevenueChart />

      {/* Activity Log */}
      <ActivityLog />
    </div>
  )
}
