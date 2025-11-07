"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PayoutScheduleCard } from "@/components/payout-schedule-card"
import { ScheduleDistributionModal } from "@/components/schedule-distribution-modal"
import { DistributionStatus } from "@/components/distribution-status"

export default function PayoutsPage() {
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const upcomingPayouts = [
    {
      id: "1",
      vault: "OpenSea Creator Fund",
      scheduledDate: "2024-07-20",
      estimatedYield: "$5,200",
      recipients: 14,
      status: "scheduled" as const,
    },
    {
      id: "2",
      vault: "Climate DAO",
      scheduledDate: "2024-07-20",
      estimatedYield: "$12,500",
      recipients: 32,
      status: "scheduled" as const,
    },
    {
      id: "3",
      vault: "Dev Commons",
      scheduledDate: "2024-07-22",
      estimatedYield: "$8,400",
      recipients: 21,
      status: "pending_approval" as const,
    },
  ]

  const recentPayouts = [
    {
      id: "4",
      vault: "OpenSea Creator Fund",
      date: "2024-06-20",
      distributedAmount: "$5,025",
      recipients: 14,
      status: "completed" as const,
      txHash: "0xabc123...def456",
    },
    {
      id: "5",
      vault: "Climate DAO",
      date: "2024-06-20",
      distributedAmount: "$12,180",
      recipients: 32,
      status: "completed" as const,
      txHash: "0xdef456...ghi789",
    },
    {
      id: "6",
      vault: "Dev Commons",
      date: "2024-06-20",
      distributedAmount: "$8,316",
      recipients: 21,
      status: "completed" as const,
      txHash: "0xghi789...jkl012",
    },
  ]

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
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingPayouts.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
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

          {upcomingPayouts.map((payout) => (
            <PayoutScheduleCard key={payout.id} payout={payout} />
          ))}
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

      <ScheduleDistributionModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
    </div>
  )
}
