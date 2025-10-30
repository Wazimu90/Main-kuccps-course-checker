"use client"

import { useState, useEffect } from "react"
import {
  Users,
  GraduationCap,
  TrendingUp,
  Download,
  FileText,
  BarChart3,
  PieChartIcon as RechartsPieChart,
  ChevronDown,
  CreditCard,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import AnalyticsChart from "@/components/admin/analytics-chart"
import SystemAlerts from "@/components/admin/system-alerts"
import RecentActivity from "@/components/admin/recent-activity"
import BarChart from "@/components/admin/bar-chart"
import PieChart from "@/components/admin/pie-chart"

const data = [
  { name: "Jan", users: 400, searches: 240, downloads: 120 },
  { name: "Feb", users: 300, searches: 139, downloads: 98 },
  { name: "Mar", users: 200, searches: 980, downloads: 390 },
  { name: "Apr", users: 278, searches: 390, downloads: 200 },
  { name: "May", users: 189, searches: 480, downloads: 181 },
  { name: "Jun", users: 239, searches: 380, downloads: 250 },
  { name: "Jul", users: 349, searches: 430, downloads: 300 },
]

export default function AdminDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
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
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pdfGenerated: 0,
    failedAttempts: 0,
    contactMessages: 0,
    successRate: 0,
    avgResponseTime: 0,
  })

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate API call - replace with actual Supabase queries
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const newDashboardData = {
          totalUsers: 1247,
          totalCourses: 8934,
          totalInstitutions: 156,
          successRate: 87.3,
          recentUsers: [
            { id: 1, name: "John Doe", email: "john@example.com", joinedAt: "2024-01-15", status: "active" },
            { id: 2, name: "Jane Smith", email: "jane@example.com", joinedAt: "2024-01-14", status: "active" },
            { id: 3, name: "Mike Johnson", email: "mike@example.com", joinedAt: "2024-01-13", status: "pending" },
          ],
          systemAlerts: [
            { id: 1, type: "warning", message: "High server load detected", timestamp: "2024-01-15 10:30" },
            { id: 2, type: "info", message: "Database backup completed", timestamp: "2024-01-15 09:00" },
          ],
          recentActivity: [
            { id: 1, action: "User registered", user: "John Doe", timestamp: "2 minutes ago" },
            { id: 2, action: "Course search", user: "Jane Smith", timestamp: "5 minutes ago" },
            { id: 3, action: "PDF downloaded", user: "Mike Johnson", timestamp: "10 minutes ago" },
          ],
        }

        const newStats = {
          totalUsers: newDashboardData.totalUsers,
          totalPayments: 856,
          totalRevenue: 428000,
          pdfGenerated: 1234,
          failedAttempts: 23,
          contactMessages: 45,
          successRate: newDashboardData.successRate,
          avgResponseTime: 1.2,
        }

        setDashboardData(newDashboardData)
        setStats(newStats)
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
  }, [toast])

  const handleExportData = (format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting data in ${format.toUpperCase()} format...`,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
          <p className="text-muted-foreground">Monitor and manage your KUCCPS Course Checker platform</p>
        </div>

        {/* Export Actions - Mobile Responsive */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button variant="outline" onClick={() => handleExportData("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExportData("pdf")}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportData("csv")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Weekly Sales</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">7k</div>
            <p className="text-xs text-green-700">Platform earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">New Users</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">57</div>
            <p className="text-xs text-blue-700">Daily registrations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">PDFs Downloaded</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-200 flex items-center justify-center">
              <FileText className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">155</div>
            <p className="text-xs text-yellow-700">Daily downloads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">News Read</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-200 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">234</div>
            <p className="text-xs text-orange-700">Daily reads</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <RechartsPieChart className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Analytics Chart */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>User activity over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart />
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Recent alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemAlerts alerts={dashboardData.systemAlerts} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={dashboardData.recentActivity} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Course Searches</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PDF Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
                <Progress value={60} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.3%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                <Progress value={87} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>Comprehensive usage statistics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart />
            </CardContent>
          </Card>

          {/* Website Analytics Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Today's sales (+43% than yesterday)</CardTitle>
                <CardDescription>Track usage patterns and system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={data} />
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Usage platforms</CardTitle>
                <CardDescription>Track usage patterns and system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart data={data} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
