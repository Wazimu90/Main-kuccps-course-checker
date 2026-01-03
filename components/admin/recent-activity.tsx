"use client"

import { CardDescription } from "@/components/ui/card"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentActivityProps {
  activities?: {
    id: number
    action: string
    user: string
    timestamp: string
  }[]
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const defaultActivities = [
    { id: 1, action: "User registered", user: "John Doe", timestamp: "2 minutes ago" },
    { id: 2, action: "Course search", user: "Jane Smith", timestamp: "5 minutes ago" },
    { id: 3, action: "PDF downloaded", user: "Mike Johnson", timestamp: "10 minutes ago" },
  ]

  const currentActivities = activities || defaultActivities

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest user actions and system events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentActivities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{activity.user.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="text-xs text-white">
                {activity.user} - {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
