"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, DollarSign, FileText, AlertTriangle, MessageSquare, TrendingUp, Clock } from "lucide-react"

interface DashboardStatsProps {
  stats?: {
    totalUsers: number
    totalPayments: number
    totalRevenue: number
    pdfGenerated: number
    failedAttempts: number
    contactMessages: number
    successRate: number
    avgResponseTime: number
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const defaultStats = {
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pdfGenerated: 0,
    failedAttempts: 0,
    contactMessages: 0,
    successRate: 0,
    avgResponseTime: 0,
  }

  const currentStats = stats || defaultStats

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(currentStats.totalUsers)}</div>
          <p className="text-xs text-muted-foreground">Registered platform users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(currentStats.totalPayments)}</div>
          <p className="text-xs text-muted-foreground">Successful transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(currentStats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Platform earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">PDFs Generated</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(currentStats.pdfGenerated)}</div>
          <p className="text-xs text-muted-foreground">Course reports downloaded</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(currentStats.failedAttempts)}</div>
          <p className="text-xs text-muted-foreground">Processing failures</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(currentStats.contactMessages)}</div>
          <p className="text-xs text-muted-foreground">User inquiries</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.successRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Course matching accuracy</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.avgResponseTime.toFixed(1)}s</div>
          <p className="text-xs text-muted-foreground">System response time</p>
        </CardContent>
      </Card>
    </div>
  )
}

export { DashboardStats }
