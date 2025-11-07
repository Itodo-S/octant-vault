"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewChart } from "@/components/overview-chart"

export function DashboardContent() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$2.4M</div>
              <p className="text-xs text-foreground/50 mt-1">↑ 12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">Yield Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$48.2K</div>
              <p className="text-xs text-foreground/50 mt-1">↑ 8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">Contributors Funded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">127</div>
              <p className="text-xs text-foreground/50 mt-1">Across 18 vaults</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">Avg APY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12.4%</div>
              <p className="text-xs text-foreground/50 mt-1">↑ 2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Yield Distribution Trend</CardTitle>
            <CardDescription>Monthly yield earned and distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and distributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Yield Distribution", vault: "OpenSea Grant Fund", amount: "+$4,200", time: "2 hours ago" },
                { action: "New Deposit", vault: "Climate DAO", amount: "+$50,000", time: "4 hours ago" },
                { action: "Contributor Payout", vault: "Dev Commons", amount: "-$2,150", time: "6 hours ago" },
                { action: "Yield Distribution", vault: "Public Health Fund", amount: "+$3,800", time: "1 day ago" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-foreground/50">{activity.vault}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{activity.amount}</p>
                    <p className="text-sm text-foreground/50">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
