"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Contributor {
  id: string
  name: string
  role: string
  wallet: string
  status: "active" | "pending"
  totalEarned: string
  monthlyAllocation: string
  joinDate: string
}

interface ContributorListProps {
  contributors: Contributor[]
}

export function ContributorList({ contributors }: ContributorListProps) {
  if (contributors.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-foreground/70">No contributors found</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {contributors.map((contributor) => (
        <Card key={contributor.id} className="hover:shadow-lg transition">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{contributor.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{contributor.name}</h3>
                    <p className="text-sm text-foreground/70">{contributor.role}</p>
                  </div>
                </div>
              </div>
              <Badge variant={contributor.status === "active" ? "default" : "secondary"}>{contributor.status}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
              <div>
                <p className="text-xs text-foreground/70">Total Earned</p>
                <p className="text-lg font-bold">{contributor.totalEarned}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/70">Monthly Allocation</p>
                <p className="text-lg font-bold text-secondary">{contributor.monthlyAllocation}</p>
              </div>
              <div>
                <p className="text-xs text-foreground/70">Joined</p>
                <p className="text-sm font-medium">{contributor.joinDate}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-foreground/50 font-mono">{contributor.wallet}</p>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
