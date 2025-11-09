"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewChart } from "@/components/overview-chart"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useAccount } from "wagmi"
import { formatEther } from "viem"

export function DashboardContent() {
  const { address } = useAccount()
  const { totalAssets, vaultCount, contributorCount, avgAPY, isLoading } = useDashboardStats()

  if (!address) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-foreground/70">Please connect your wallet to view dashboard</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

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
              {isLoading ? (
                <div className="text-3xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    {totalAssets ? `$${Number(totalAssets).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '$0'}
                  </div>
                  <p className="text-xs text-foreground/50 mt-1">Across all vaults</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">Yield Earned</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-3xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">$0</div>
                  <p className="text-xs text-foreground/50 mt-1">From Spark's curated yield</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">Vaults Deployed</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-3xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{vaultCount}</div>
                  <p className="text-xs text-foreground/50 mt-1">Active vaults</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/70">Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-3xl font-bold animate-pulse">...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{contributorCount}</div>
                  <p className="text-xs text-foreground/50 mt-1">Active contributors</p>
                </>
              )}
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
