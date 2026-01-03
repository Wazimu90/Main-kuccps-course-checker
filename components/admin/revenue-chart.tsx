"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

type Period = "day" | "week" | "month"

export default function RevenueChart() {
  const { toast } = useToast()
  const [period, setPeriod] = useState<Period>("day")
  const [data, setData] = useState<Array<{ date: string; revenue: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (p: Period) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/revenue?period=${p}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load revenue data")
      const json = await res.json()
      setData(json.data)
    } catch (e: any) {
      setError(e.message || "Unknown error")
      toast({ title: "Error", description: "Failed to load revenue data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(period)
  }, [period])

  const COLORS = ["#22c55e", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#3b82f6"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue Trends</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              type="button"
              onClick={() => loadData(period)}
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[280px] md:h-[360px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-white">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.06)" }}
                contentStyle={{
                  background: "#0b1020",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "#fff",
                  padding: "8px 10px",
                }}
                itemStyle={{ color: "#fff", fontSize: 12 }}
                labelStyle={{ color: "#cbd5e1", fontSize: 12 }}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fillOpacity={1} stroke="#064e3b" strokeOpacity={0.15}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
