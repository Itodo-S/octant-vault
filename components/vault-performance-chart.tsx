"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jul", yield: 4200, distributed: 3000 },
  { month: "Aug", yield: 4800, distributed: 3500 },
  { month: "Sep", yield: 5100, distributed: 3800 },
  { month: "Oct", yield: 5500, distributed: 4200 },
  { month: "Nov", yield: 5800, distributed: 4500 },
  { month: "Dec", yield: 6200, distributed: 4800 },
]

export function VaultPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis stroke="var(--color-foreground)" />
        <YAxis stroke="var(--color-foreground)" />
        <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "none", borderRadius: "8px" }} />
        <Legend />
        <Bar dataKey="yield" fill="var(--color-primary)" name="Yield Earned" />
        <Bar dataKey="distributed" fill="var(--color-secondary)" name="Distributed to Contributors" />
      </BarChart>
    </ResponsiveContainer>
  )
}
