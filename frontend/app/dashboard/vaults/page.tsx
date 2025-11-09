"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VaultCardItem } from "@/components/vault-card-item"
import { CreateVaultModal } from "@/components/create-vault-modal"
import { useAllVaults, useVaultInfo } from "@/hooks/use-vaults"
import { useAccount } from "wagmi"
import { formatEther } from "viem"
import { Card, CardContent } from "@/components/ui/card"

export default function VaultsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const { address } = useAccount()
  const { vaults, vaultCount, isLoading } = useAllVaults()

  // Prevent hydration mismatch by only checking address after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredVaults = useMemo(() => {
    if (!vaults) return []
    return vaults.filter((vault) => {
      // For now, we'll just return all vaults
      // In production, you'd fetch vault info and filter by name/description
      return true
    })
  }, [vaults, searchQuery])

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vaults</h1>
            <p className="text-foreground/70 mt-1">Manage and monitor all active vaults</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-48" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!address) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Please connect your wallet to view vaults</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vaults</h1>
          <p className="text-foreground/70 mt-1">Manage and monitor all active vaults</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
          + Create Vault
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search vaults..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-48" />
            </Card>
          ))}
        </div>
      ) : vaultCount === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70 mb-4">No vaults deployed yet</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
              Create Your First Vault
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVaults.map((vaultAddress) => (
            <VaultCardItem key={vaultAddress} vaultAddress={vaultAddress} />
          ))}
        </div>
      )}

      <CreateVaultModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  )
}
