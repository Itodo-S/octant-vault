"use client"

import { Card } from "@/components/ui/card"

export function ImpactTimeline() {
  const events = [
    {
      date: "June 15, 2024",
      title: "Monthly Distribution Complete",
      description: "Distributed $28,520 to 127 contributors across 18 vaults",
      type: "distribution",
    },
    {
      date: "June 10, 2024",
      title: "Yield Generation Peak",
      description: "Generated $32,450 in combined yield across all strategies",
      type: "yield",
    },
    {
      date: "June 5, 2024",
      title: "New Vault Deployed",
      description: "Education Impact Fund launched with $250,000 initial deposit",
      type: "deployment",
    },
    {
      date: "May 31, 2024",
      title: "Voting Round Completed",
      description: "Community voted to increase allocation for 8 contributors",
      type: "voting",
    },
    {
      date: "May 20, 2024",
      title: "Major Deposit",
      description: "$500,000 deposited to Climate DAO vault",
      type: "deposit",
    },
    {
      date: "May 15, 2024",
      title: "Previous Distribution",
      description: "Distributed $26,340 to 112 contributors",
      type: "distribution",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "distribution":
        return "bg-primary/10 border-primary/30"
      case "yield":
        return "bg-secondary/10 border-secondary/30"
      case "deployment":
        return "bg-accent/10 border-accent/30"
      case "voting":
        return "bg-chart-3/10 border-chart-3/30"
      case "deposit":
        return "bg-chart-4/10 border-chart-4/30"
      default:
        return "bg-muted/10 border-border"
    }
  }

  return (
    <div className="space-y-4">
      {events.map((event, idx) => (
        <div key={idx} className="flex gap-4">
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20"></div>
            {idx < events.length - 1 && <div className="w-0.5 h-16 bg-border mt-2"></div>}
          </div>

          {/* Event content */}
          <Card className={`flex-1 p-4 border-l-4 ${getTypeColor(event.type)}`}>
            <p className="text-xs text-foreground/50 font-medium uppercase">{event.date}</p>
            <h4 className="font-bold mt-1">{event.title}</h4>
            <p className="text-sm text-foreground/70">{event.description}</p>
          </Card>
        </div>
      ))}
    </div>
  )
}
