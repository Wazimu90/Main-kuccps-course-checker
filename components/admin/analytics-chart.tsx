"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jan", users: 400, searches: 240, downloads: 120 },
  { name: "Feb", users: 300, searches: 139, downloads: 98 },
  { name: "Mar", users: 200, searches: 980, downloads: 390 },
  { name: "Apr", users: 278, searches: 390, downloads: 200 },
  { name: "May", users: 189, searches: 480, downloads: 181 },
  { name: "Jun", users: 239, searches: 380, downloads: 250 },
  { name: "Jul", users: 349, searches: 430, downloads: 300 },
]

export default function AnalyticsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Analytics</CardTitle>
        <CardDescription>Platform usage trends over the last 7 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="searches" stroke="#82ca9d" strokeWidth={2} />
            <Line type="monotone" dataKey="downloads" stroke="#ffc658" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export { AnalyticsChart }
