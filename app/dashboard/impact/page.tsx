"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImpactMetricsOverview } from "@/components/impact-metrics-overview"
import { ImpactDistributionChart } from "@/components/impact-distribution-chart"
import { ImpactTimeline } from "@/components/impact-timeline"
import { Button } from "@/components/ui/button"

export default function ImpactPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impact Metrics</h1>
        <p className="text-foreground/70 mt-1">Transparent tracking of yield distribution and public goods funding</p>
      </div>

      {/* Key Impact Metrics */}
      <ImpactMetricsOverview />

      {/* Charts and Analytics */}
      <Tabs defaultValue="distribution" className="w-full">
        <TabsList>
          <TabsTrigger value="distribution">Distribution Analysis</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="export">Export Report</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yield Distribution by Vault</CardTitle>
              <CardDescription>How yield has been allocated across all vaults</CardDescription>
            </CardHeader>
            <CardContent>
              <ImpactDistributionChart />
            </CardContent>
          </Card>

          {/* Distribution Details */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Distribution Breakdown</CardTitle>
              <CardDescription>Detailed payout information for current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { vault: "OpenSea Creator Fund", yield: "$5,025", distributed: "$3,518", fundedContributors: 14 },
                  { vault: "Climate DAO", yield: "$12,180", distributed: "$8,526", fundedContributors: 32 },
                  { vault: "Dev Commons", yield: "$8,316", distributed: "$5,821", fundedContributors: 21 },
                  { vault: "Public Health Fund", yield: "$3,220", distributed: "$2,254", fundedContributors: 8 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.vault}</p>
                      <p className="text-xs text-foreground/70">{item.fundedContributors} contributors funded</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.distributed}</p>
                      <p className="text-xs text-foreground/70">from {item.yield}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution Timeline</CardTitle>
              <CardDescription>Historical view of all distributions</CardDescription>
            </CardHeader>
            <CardContent>
              <ImpactTimeline />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Export impact metrics and transparency data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-bold mb-2">Monthly Impact Report</h4>
                  <p className="text-sm text-foreground/70 mb-3">
                    Comprehensive report of yield generation, distributions, and contributor impact
                  </p>
                  <Button variant="outline" size="sm">
                    Download CSV
                  </Button>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-bold mb-2">Annual Transparency Report</h4>
                  <p className="text-sm text-foreground/70 mb-3">
                    Year-to-date impact metrics, cumulative distributions, and on-chain verification
                  </p>
                  <Button variant="outline" size="sm">
                    Download PDF
                  </Button>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-bold mb-2">Contributor Performance Report</h4>
                  <p className="text-sm text-foreground/70 mb-3">
                    Detailed breakdown of individual contributor earnings and voting history
                  </p>
                  <Button variant="outline" size="sm">
                    Download XLSX
                  </Button>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h4 className="font-bold mb-2">On-Chain Verification Data</h4>
                  <p className="text-sm text-foreground/70 mb-3">
                    Raw blockchain transaction data for full transparency and auditability
                  </p>
                  <Button variant="outline" size="sm">
                    Download JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
