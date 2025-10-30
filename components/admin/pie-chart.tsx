"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const pieData = [
  { name: "Smartphones", value: 27.7, color: "#3b82f6" },
  { name: "Desktop/Large screens", value: 34.7, color: "#1e40af" },
  { name: "Laptops", value: 28.4, color: "#ef4444" },
  { name: "Tablet", value: 9.2, color: "#f59e0b" },
]

interface PieChartProps {
  data: Array<{
    name: string
    users: number
    searches: number
    downloads: number
  }>
}

export default function PieChartComponent({ data }: PieChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
