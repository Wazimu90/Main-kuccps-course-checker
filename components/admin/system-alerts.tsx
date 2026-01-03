"use client"

import { CardDescription } from "@/components/ui/card"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface SystemAlertsProps {
  alerts?: {
    id: number
    type: string
    message: string
    timestamp: string
  }[]
}

export default function SystemAlerts({ alerts }: SystemAlertsProps) {
  const defaultAlerts = [
    { id: 1, type: "warning", message: "High server load detected", timestamp: "2024-01-15 10:30" },
    { id: 2, type: "info", message: "Database backup completed", timestamp: "2024-01-15 09:00" },
  ]

  const currentAlerts = alerts || defaultAlerts

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Alerts</CardTitle>
        <CardDescription>Recent alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAlerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1" />
            <div>
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs text-white">{alert.timestamp}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
