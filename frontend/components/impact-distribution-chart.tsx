"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "OpenSea Creator Fund", value: 25 },
  { name: "Climate DAO", value: 42 },
  { name: "Dev Commons", value: 22 },
  { name: "Public Health Fund", value: 11 },
]

const COLORS = ["var(--color-primary)", "var(--color-secondary)", "var(--color-chart-3)", "var(--color-chart-4)"]

export function ImpactDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
