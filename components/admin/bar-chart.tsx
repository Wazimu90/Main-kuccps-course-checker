"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BarChartProps {
  data: Array<{
    name: string
    users: number
    searches: number
    downloads: number
  }>
}

export default function BarChartComponent({ data }: BarChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="users"
            fill="#10b981"
            name="Users"
            stroke="#047857"
            strokeOpacity={0.15}
            fillOpacity={1}
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="searches"
            fill="#10b981"
            name="Searches"
            stroke="#047857"
            strokeOpacity={0.15}
            fillOpacity={1}
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="downloads"
            fill="#10b981"
            name="Downloads"
            stroke="#047857"
            strokeOpacity={0.15}
            fillOpacity={1}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
