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
import { useAccount, useReadContract } from "wagmi"
import { useVaultInfo } from "@/hooks/use-vaults"
import { useVaultContributors } from "@/hooks/use-contributors"
import { formatEther, formatUnits } from "viem"
import { Address } from "viem"
import VaultABI from "@/lib/abis/Vault.json"
import SparkVaultABI from "@/lib/abis/SparkVault.json"
import { getAssetName, getAssetDecimalsByAddress } from "@/lib/assets"
import { Skeleton } from "@/components/ui/skeleton"
import { CONTRACTS } from "@/lib/contracts"

export default function VaultDetailPage() {
  const params = useParams()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const { address } = useAccount()
  const vaultAddress = params.id as Address
  
  const { vaultInfo, isLoading: isLoadingVault, refetch: refetchVaultInfo } = useVaultInfo(vaultAddress)
  const { contributors, contributorData, isLoading: isLoadingContributors } = useVaultContributors(vaultAddress)
  const { data: totalAssetsDirect, refetch: refetchTotalAssets } = useReadContract({
    address: vaultAddress,
    abi: VaultABI.abi as any,
    functionName: 'totalAssets',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 5000,
    },
  })

  const { data: totalSupplyDirect, refetch: refetchTotalSupply } = useReadContract({
    address: vaultAddress,
    abi: VaultABI.abi as any,
    functionName: 'totalSupply',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 5000,
    },
  })

  // Use direct reads as fallback if vaultInfo is missing or shows 0
  const effectiveTotalAssets = vaultInfo?.totalAssetsValue && vaultInfo.totalAssetsValue > 0n
    ? vaultInfo.totalAssetsValue
    : (totalAssetsDirect ? BigInt(String(totalAssetsDirect)) : 0n)
  
  const effectiveTotalSupply = vaultInfo?.totalSupplyValue && vaultInfo.totalSupplyValue > 0n
    ? vaultInfo.totalSupplyValue
    : (totalSupplyDirect ? BigInt(String(totalSupplyDirect)) : 0n)
  const { data: sparkVaultInfo } = useReadContract({
    address: vaultAddress,
    abi: SparkVaultABI.abi as any,
    functionName: 'getVaultInfo',
    query: {
      enabled: !!vaultAddress,
    },
  })

  // Try to get asset address from vault contract
  const { data: sparkAsset } = useReadContract({
    address: vaultAddress,
    abi: SparkVaultABI.abi as any,
    functionName: 'asset',
    query: {
      enabled: !!vaultAddress,
    },
  })

  const { data: regularAsset } = useReadContract({
    address: vaultAddress,
    abi: VaultABI.abi as any,
    functionName: 'asset',
    query: {
      enabled: !!vaultAddress && !sparkAsset,
    },
  })

  const assetAddress = (sparkAsset || regularAsset) as Address | undefined
  const assetName = assetAddress ? getAssetName(assetAddress) : 'Unknown'
  const assetDecimals = assetAddress ? getAssetDecimalsByAddress(assetAddress) : 18

  // Try to get owner/deployer from vault contract
  const { data: sparkOwner } = useReadContract({
    address: vaultAddress,
    abi: SparkVaultABI.abi as any,
    functionName: 'owner',
    query: {
      enabled: !!vaultAddress,
    },
  })

  const { data: regularOwner } = useReadContract({
    address: vaultAddress,
    abi: VaultABI.abi as any,
    functionName: 'owner',
    query: {
      enabled: !!vaultAddress && !sparkOwner,
    },
  })

  const ownerAddress = (sparkOwner || regularOwner) as Address | undefined

  // Extract availableYield from SparkVault info (6th value in tuple)
  const availableYield = sparkVaultInfo && Array.isArray(sparkVaultInfo) && sparkVaultInfo.length >= 5
    ? (sparkVaultInfo[4] as bigint)
    : undefined

  if (!address) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Please connect your wallet to view vault details</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoadingVault) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Loading vault...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!vaultInfo) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Vault not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format total assets with correct decimals
  const totalAssetsFormatted = effectiveTotalAssets > 0n
    ? Number(formatUnits(effectiveTotalAssets, assetDecimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '0'
  
  // Format total supply with correct decimals (shares typically use 18 decimals)
  const totalSupplyFormatted = effectiveTotalSupply > 0n
    ? Number(formatEther(effectiveTotalSupply)).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '0'

  const vault = {
    id: vaultAddress,
    name: vaultInfo?.name || 'Unnamed Vault',
    description: vaultInfo?.description || 'No description',
    totalAssets: `$${totalAssetsFormatted}`,
    yieldAPY: "0%", // Would need to calculate from yield
    monthlyYield: "$0", // Would need to calculate
    contributors: contributors?.length || 0,
    status: "active" as const,
    deployer: ownerAddress ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}` : 'Unknown',
    owner: ownerAddress,
    asset: assetName,
    assetAddress: assetAddress,
    strategyName: sparkAsset ? "Spark's Curated Yield" : "Standard Vault",
    lastDistribution: "N/A",
    nextDistribution: "N/A",
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
              {isLoadingVault ? (
                <div className="space-y-4">
                  <Skeleton className="h-[300px] w-full" />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ) : (
                <VaultPerformanceChart 
                  totalAssets={effectiveTotalAssets}
                  totalSupply={effectiveTotalSupply}
                  availableYield={availableYield}
                  vaultAddress={vaultAddress}
                  assetDecimals={assetDecimals}
                />
              )}
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
              {isLoadingContributors ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-5 w-20 ml-auto" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !contributorData || contributorData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground/70 mb-4">No contributors added yet</p>
                  <p className="text-sm text-foreground/50">Add contributors to start distributing yield</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contributorData
                    .filter((contributor) => contributor.isActive)
                    .map((contributor, idx) => (
                      <div
                        key={contributor.wallet || idx}
                        className="flex items-center justify-between py-3 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-medium">{contributor.name || 'Unnamed Contributor'}</p>
                          <p className="text-sm text-foreground/70">{contributor.role || 'No role specified'}</p>
                          <p className="text-xs text-foreground/50 font-mono mt-1">
                            {contributor.wallet?.slice(0, 6)}...{contributor.wallet?.slice(-4)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            ${Number(formatEther(contributor.totalEarned || 0n)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-foreground/50">
                            {Number(formatEther(contributor.monthlyAllocation || 0n)).toLocaleString(undefined, { maximumFractionDigits: 2 })}/month
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vault Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingVault || (!sparkAsset && !regularAsset) || !ownerAddress ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-foreground/70">Asset</p>
                    <p className="text-lg font-medium">{vault.asset}</p>
                    {assetAddress && (
                      <p className="text-xs text-foreground/50 font-mono mt-1">
                        {assetAddress.slice(0, 6)}...{assetAddress.slice(-4)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Strategy</p>
                    <p className="text-lg font-medium">{vault.strategyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Owner/Deployer</p>
                    <p className="text-lg font-medium font-mono text-sm">{vault.deployer}</p>
                    {ownerAddress && (
                      <a
                        href={`${CONTRACTS.EXPLORER_URL}/address/${ownerAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View on Explorer
                      </a>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Vault Address</p>
                    <p className="text-lg font-medium font-mono text-sm">{vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}</p>
                    <a
                      href={`${CONTRACTS.EXPLORER_URL}/address/${vaultAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      View on Explorer
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Total Assets</p>
                    <p className="text-lg font-medium">{vault.totalAssets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Total Shares</p>
                    <p className="text-lg font-medium">
                      {Number(formatEther(effectiveTotalSupply)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Last Distribution</p>
                    <p className="text-lg font-medium">{vault.lastDistribution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70">Next Distribution</p>
                    <p className="text-lg font-medium">{vault.nextDistribution}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DepositModal 
        open={showDepositModal} 
        onOpenChange={setShowDepositModal} 
        vaultAddress={vaultAddress}
        assetName={vault.asset}
        assetAddress={vault.assetAddress}
      />
      <WithdrawModal 
        open={showWithdrawModal} 
        onOpenChange={setShowWithdrawModal} 
        vaultAddress={vaultAddress}
      />
    </div>
  )
}
