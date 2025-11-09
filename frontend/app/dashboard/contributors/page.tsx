"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContributorList } from "@/components/contributor-list"
import { AddContributorModal } from "@/components/add-contributor-modal"
import { useAccount } from "wagmi"
import { useVaultContributors, useContributorInfo } from "@/hooks/use-contributors"
import { useAllVaults } from "@/hooks/use-vaults"
import { useApiContributors } from "@/hooks/use-api"
import { formatEther } from "viem"
import { Address } from "viem"

export default function ContributorsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVault, setSelectedVault] = useState<Address | undefined>()
  const { address } = useAccount()
  const { vaults } = useAllVaults()
  const { contributors: contributorAddresses, contributorData: contractContributorData, isLoading: isLoadingContributors, refetch: refetchContractContributors } = useVaultContributors(selectedVault)
  const { data: apiContributors, isLoading: isLoadingApi, refetch: refetchApiContributors } = useApiContributors(selectedVault)

  // Refetch contributors when vault selection changes
  useEffect(() => {
    if (selectedVault) {
      refetchContractContributors()
      refetchApiContributors()
    }
  }, [selectedVault, refetchContractContributors, refetchApiContributors])

  const contributors = useMemo(() => {
    if (!selectedVault) return []
    
    // Use contract data as primary source (it's always up-to-date)
    if (contractContributorData && contractContributorData.length > 0) {
      
      // Create a map of API data by wallet address for merging
      const apiDataMap = new Map()
      if (apiContributors?.success && apiContributors.data) {
        apiContributors.data.forEach((c: any) => {
          apiDataMap.set(c.wallet?.toLowerCase(), c)
        })
      }
      
      // Map contract data, merging with API data when available
      return contractContributorData
        .filter((c) => c.isActive) // Only show active contributors
        .map((c) => {
          const apiData = apiDataMap.get(c.wallet?.toLowerCase())
          return {
            id: apiData?._id || c.wallet,
            name: c.name || apiData?.name || 'Unnamed Contributor',
            role: c.role || apiData?.role || 'No role',
            wallet: c.wallet,
            status: c.isActive ? 'active' : 'inactive',
            totalEarned: `$${Number(formatEther(c.totalEarned || 0n)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            monthlyAllocation: `$${Number(formatEther(c.monthlyAllocation || 0n)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            joinDate: apiData?.createdAt ? new Date(apiData.createdAt).toISOString().split('T')[0] : 'N/A',
          }
        })
    }
    
    // Fallback to API data if contract data is not available
    if (apiContributors?.success && apiContributors.data) {
      return apiContributors.data.map((c: any) => ({
        id: c._id || c.wallet,
        name: c.name,
        role: c.role,
        wallet: c.wallet,
        status: c.isActive ? 'active' : 'inactive',
        totalEarned: `$${Number(formatEther(BigInt(c.totalEarned || '0'))).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        monthlyAllocation: `$${Number(formatEther(BigInt(c.monthlyAllocation || '0'))).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        joinDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : 'N/A',
      }))
    }
    
    return []
  }, [selectedVault, apiContributors, contractContributorData])

  const filteredContributors = useMemo(() => {
    return contributors.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.wallet?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [contributors, searchQuery])

  if (!address) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Please connect your wallet to view contributors</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contributors</h1>
          <p className="text-foreground/70 mt-1">Manage team members and allocations</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90">
          + Add Contributor
        </Button>
      </div>

      {vaults && vaults.length > 0 && (
        <div className="flex gap-4 items-center">
          <select
            value={selectedVault || ""}
            onChange={(e) => setSelectedVault(e.target.value as Address)}
            className="px-4 py-2 border rounded-lg bg-background"
          >
            <option value="">Select a vault</option>
            {vaults.map((vault) => (
              <option key={vault} value={vault}>
                {vault.slice(0, 6)}...{vault.slice(-4)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search contributors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {(isLoadingContributors || isLoadingApi) ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Loading contributors...</p>
          </CardContent>
        </Card>
      ) : !selectedVault ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Please select a vault to view contributors</p>
          </CardContent>
        </Card>
      ) : contributorAddresses && contributorAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70 mb-4">No contributors found for this vault</p>
            <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90">
              Add First Contributor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({filteredContributors.length})</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <ContributorList contributors={filteredContributors} />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <ContributorList contributors={filteredContributors.filter((c: any) => c.status === "active")} />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center text-foreground/70">No pending contributor requests</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <AddContributorModal open={showAddModal} onOpenChange={setShowAddModal} vaultAddress={selectedVault} />
    </div>
  )
}
