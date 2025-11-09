"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", yield: 12000, distributed: 8000 },
  { month: "Feb", yield: 19000, distributed: 13500 },
  { month: "Mar", yield: 15000, distributed: 10800 },
  { month: "Apr", yield: 22000, distributed: 15000 },
  { month: "May", yield: 28000, distributed: 20000 },
  { month: "Jun", yield: 32000, distributed: 23000 },
]

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis stroke="var(--color-foreground)" />
        <YAxis stroke="var(--color-foreground)" />
        <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "none", borderRadius: "8px" }} />
        <Line
          type="monotone"
          dataKey="yield"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          name="Yield Earned"
        />
        <Line
          type="monotone"
          dataKey="distributed"
          stroke="var(--color-secondary)"
          strokeWidth={2}
          dot={false}
          name="Distributed"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
