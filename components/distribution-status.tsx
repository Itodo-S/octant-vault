"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DistributionStatus() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Next Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">July 20, 2024</p>
          <p className="text-xs text-foreground/50 mt-1">in 5 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Expected Yield</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-secondary">$25,900</p>
          <p className="text-xs text-foreground/50 mt-1">across 3 vaults</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">67</p>
          <p className="text-xs text-foreground/50 mt-1">this round</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">This Month's Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">$28,520</p>
          <p className="text-xs text-foreground/50 mt-1">already distributed</p>
        </CardContent>
      </Card>
    </div>
  )
}
