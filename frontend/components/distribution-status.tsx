"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApiUpcomingDistributions, useApiRecentDistributions } from "@/hooks/use-api"
import { useAllDistributions } from "@/hooks/use-distributions"

export function DistributionStatus() {
  const { data: apiUpcoming } = useApiUpcomingDistributions()
  const { data: apiRecent } = useApiRecentDistributions()
  const { scheduleIds } = useAllDistributions()

  // Find next upcoming distribution
  const nextDistribution = useMemo(() => {
    if (apiUpcoming?.success && apiUpcoming.data && apiUpcoming.data.length > 0) {
      // Sort by scheduled time and get the earliest
      const sorted = [...apiUpcoming.data].sort((a: any, b: any) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      )
      return sorted[0]
    }
    return null
  }, [apiUpcoming])

  // Calculate total distributed this month
  const totalDistributed = useMemo(() => {
    if (apiRecent?.success && apiRecent.data) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      return apiRecent.data
        .filter((d: any) => d.executedAt && new Date(d.executedAt) >= startOfMonth)
        .reduce((sum: number, d: any) => sum + Number(d.totalAmount || '0'), 0)
    }
    return 0
  }, [apiRecent])

  // Format next distribution date
  const nextDate = nextDistribution 
    ? new Date(nextDistribution.scheduledTime).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : 'No upcoming distributions'

  // Calculate days until next distribution
  const daysUntil = nextDistribution
    ? Math.ceil((new Date(nextDistribution.scheduledTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Next Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{nextDate}</p>
          {daysUntil !== null && daysUntil > 0 && (
            <p className="text-xs text-foreground/50 mt-1">in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Expected Yield</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-secondary">$0</p>
          <p className="text-xs text-foreground/50 mt-1">
            {scheduleIds?.length || 0} scheduled distribution{scheduleIds?.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {nextDistribution?.recipientCount || 0}
          </p>
          <p className="text-xs text-foreground/50 mt-1">this round</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">This Month's Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ${(totalDistributed / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-foreground/50 mt-1">already distributed</p>
        </CardContent>
      </Card>
    </div>
  )
}
