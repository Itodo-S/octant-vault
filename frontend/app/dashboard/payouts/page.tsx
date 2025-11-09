"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PayoutScheduleCard } from "@/components/payout-schedule-card"
import { ScheduleDistributionModal } from "@/components/schedule-distribution-modal"
import { DistributionStatus } from "@/components/distribution-status"
import { useAccount } from "wagmi"
import { useAllDistributions, useDistributionById } from "@/hooks/use-distributions"
import { useApiUpcomingDistributions, useApiRecentDistributions } from "@/hooks/use-api"
import { formatEther } from "viem"
import { useVaultInfo } from "@/hooks/use-vaults"
import { Address } from "viem"
import { useReadContract } from "wagmi"
import { useDistribution } from "@/hooks/use-contracts"

export default function PayoutsPage() {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { address } = useAccount()
  const { scheduleIds, isLoading } = useAllDistributions()
  const { data: apiUpcoming, isLoading: isLoadingUpcoming } = useApiUpcomingDistributions()
  const { data: apiRecent, isLoading: isLoadingRecent } = useApiRecentDistributions()

  // Fetch contract distribution data as fallback
  const { address: distributionAddress, abi } = useDistribution()
  
  // Fetch distribution data from contract for each schedule ID
  const contractUpcomingDistributions = useMemo(() => {
    if (!scheduleIds || scheduleIds.length === 0) return []
    
    // Filter for upcoming (not executed) distributions
    // We'll fetch them individually using useDistributionById
    return scheduleIds.filter((id) => {
      // We'll check if it's executed when we fetch the data
      return true
    })
  }, [scheduleIds])

  const upcomingPayouts = useMemo(() => {
    if (apiUpcoming?.success && apiUpcoming.data && apiUpcoming.data.length > 0) {
      return apiUpcoming.data.map((d: any) => ({
        id: d.scheduleId.toString(),
        vault: d.vault,
        scheduledDate: new Date(d.scheduledTime).toISOString().split('T')[0],
        estimatedYield: '$0',
        recipients: d.recipientCount || 0,
        status: 'scheduled' as const,
      }))
    }
    
    if (scheduleIds && scheduleIds.length > 0) {
      return []
    }
    
    return []
  }, [apiUpcoming, scheduleIds])

  const recentPayouts = useMemo(() => {
    if (apiRecent?.success && apiRecent.data) {
      return apiRecent.data.map((d: any) => ({
        id: d.scheduleId.toString(),
        vault: d.vault,
        date: d.executedAt ? new Date(d.executedAt).toISOString().split('T')[0] : 'N/A',
        distributedAmount: `$${Number(formatEther(BigInt(d.totalAmount || '0'))).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        recipients: d.recipientCount || 0,
        status: 'completed' as const,
        txHash: '0x...',
      }))
    }
    return []
  }, [apiRecent])

  if (!address) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Please connect your wallet to view payouts</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payouts & Distribution</h1>
          <p className="text-foreground/70 mt-1">Manage automated yield distribution to contributors</p>
        </div>
        <Button onClick={() => setShowScheduleModal(true)} className="bg-primary hover:bg-primary/90">
          + Schedule Distribution
        </Button>
      </div>

      {/* Distribution Status Overview */}
      <DistributionStatus />

      {/* Payout Tabs */}
      {(isLoading || isLoadingUpcoming || isLoadingRecent) ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Loading distributions...</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingPayouts.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent ({recentPayouts.length})</TabsTrigger>
            <TabsTrigger value="streaming">Streaming Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex gap-4 items-center mb-4">
              <Input
                placeholder="Search payouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {upcomingPayouts.length === 0 && scheduleIds && scheduleIds.length > 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-foreground/70 mb-2">Distributions are being synced...</p>
                  <p className="text-sm text-foreground/50 mb-4">
                    Found {scheduleIds.length} distribution(s) on-chain. Waiting for backend to sync.
                  </p>
                  <Button onClick={() => {
                    window.location.reload()
                  }} className="bg-primary hover:bg-primary/90">
                    Refresh Page
                  </Button>
                </CardContent>
              </Card>
            ) : upcomingPayouts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-foreground/70">No upcoming payouts</CardContent>
              </Card>
            ) : (
              upcomingPayouts.map((payout: any) => (
                <PayoutScheduleCard key={payout.id} payout={payout} />
              ))
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="space-y-4">
              {recentPayouts.map((payout) => (
                <Card key={payout.id} className="hover:shadow-lg transition">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{payout.vault}</h3>
                        <p className="text-sm text-foreground/70">{payout.date}</p>
                      </div>
                      <Badge variant="default">Completed</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
                      <div>
                        <p className="text-xs text-foreground/70">Amount Distributed</p>
                        <p className="text-2xl font-bold text-secondary">{payout.distributedAmount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/70">Recipients</p>
                        <p className="text-2xl font-bold">{payout.recipients}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/70">Avg Per Recipient</p>
                        <p className="text-lg font-bold">
                          ${(Number.parseFloat(payout.distributedAmount.replace("$", "")) / payout.recipients).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <a
                        href={`https://etherscan.io/tx/${payout.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm font-mono"
                      >
                        {payout.txHash}
                      </a>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="streaming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Streaming Distribution Settings</CardTitle>
                <CardDescription>Configure automatic yield distribution schedules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    vault: "OpenSea Creator Fund",
                    frequency: "Weekly",
                    day: "Monday",
                    time: "00:00 UTC",
                    enabled: true,
                  },
                  {
                    vault: "Climate DAO",
                    frequency: "Monthly",
                    day: "20th",
                    time: "00:00 UTC",
                    enabled: true,
                  },
                  {
                    vault: "Dev Commons",
                    frequency: "Bi-weekly",
                    day: "Wednesday",
                    time: "12:00 UTC",
                    enabled: true,
                  },
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-bold">{setting.vault}</h4>
                      <p className="text-sm text-foreground/70">
                        {setting.frequency} on {setting.day} at {setting.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={setting.enabled ? "default" : "secondary"}>
                        {setting.enabled ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Rules</CardTitle>
                <CardDescription>Define how yield is allocated to contributors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h4 className="font-bold mb-2">Distribution Method</h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" defaultChecked />
                      <span>Proportional to Monthly Allocation</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" />
                      <span>Equal Split Among Contributors</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" />
                      <span>Voting-Weighted Distribution</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Reserved Funds</h4>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Percentage" defaultValue="10" className="w-20" />
                    <span className="text-sm text-foreground/70">% held for operations</span>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <ScheduleDistributionModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
    </div>
  )
}
