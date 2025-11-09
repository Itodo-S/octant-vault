"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ImpactMetricsOverview() {
  const metrics = [
    {
      label: "Total Yield Generated",
      value: "$2.84M",
      change: "+18% YTD",
      description: "Across all vaults",
    },
    {
      label: "Total Distributed",
      value: "$1.98M",
      change: "+22% YTD",
      description: "To contributors",
    },
    {
      label: "Contributors Funded",
      value: "427",
      change: "+45% YTD",
      description: "Active recipients",
    },
    {
      label: "Public Projects Supported",
      value: "58",
      change: "+12% YTD",
      description: "Organizations",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/70">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{metric.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground/60">{metric.description}</p>
              <span className="text-xs text-secondary font-medium">{metric.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
