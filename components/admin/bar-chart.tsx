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
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="users" fill="#3b82f6" name="Users" />
          <Bar dataKey="searches" fill="#f59e0b" name="Searches" />
          <Bar dataKey="downloads" fill="#10b981" name="Downloads" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
