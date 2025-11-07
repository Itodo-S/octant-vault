"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VaultPerformanceChart } from "@/components/vault-performance-chart"
import { DepositModal } from "@/components/deposit-modal"
import { WithdrawModal } from "@/components/withdraw-modal"

export default function VaultDetailPage() {
  const params = useParams()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const vault = {
    id: params.id,
    name: "OpenSea Creator Fund",
    description: "Funding for open source NFT marketplace contributors",
    totalAssets: "$482,000",
    yieldAPY: "12.5%",
    monthlyYield: "$5,025",
    contributors: 14,
    status: "active" as const,
    deployer: "0x742d35Cc6634C0532925a3b844Bc9e7595f8F3A",
    asset: "USDC",
    strategyName: "Yield Optimization (Uniswap + Yearn)",
    lastDistribution: "2024-06-15",
    nextDistribution: "2024-07-15",
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{vault.name}</h1>
          <p className="text-foreground/70 mt-1">{vault.description}</p>
        </div>
        <Badge variant={vault.status === "active" ? "default" : "secondary"}>{vault.status}</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{vault.totalAssets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Yield APY</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">{vault.yieldAPY}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{vault.monthlyYield}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{vault.contributors}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Yield Performance</CardTitle>
              <CardDescription>Last 12 months of yield generation</CardDescription>
            </CardHeader>
            <CardContent>
              <VaultPerformanceChart />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => setShowDepositModal(true)} className="bg-primary hover:bg-primary/90">
              Deposit
            </Button>
            <Button onClick={() => setShowWithdrawModal(true)} variant="outline">
              Withdraw
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="contributors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contributors</CardTitle>
              <CardDescription>Team members receiving yield distributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Alex Chen", role: "Lead Developer", earned: "$4,200" },
                  { name: "Maria Garcia", role: "Designer", earned: "$3,100" },
                  { name: "James Wilson", role: "Community Manager", earned: "$2,850" },
                  { name: "Sofia Rossi", role: "Smart Contract Auditor", earned: "$3,500" },
                ].map((contributor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{contributor.name}</p>
                      <p className="text-sm text-foreground/70">{contributor.role}</p>
                    </div>
                    <p className="font-bold">{contributor.earned}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vault Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70">Asset</p>
                <p className="text-lg font-medium">{vault.asset}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Strategy</p>
                <p className="text-lg font-medium">{vault.strategyName}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Deployer</p>
                <p className="text-lg font-medium font-mono text-sm">{vault.deployer}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Last Distribution</p>
                <p className="text-lg font-medium">{vault.lastDistribution}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Next Distribution</p>
                <p className="text-lg font-medium">{vault.nextDistribution}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DepositModal open={showDepositModal} onOpenChange={setShowDepositModal} />
      <WithdrawModal open={showWithdrawModal} onOpenChange={setShowWithdrawModal} />
    </div>
  )
}
