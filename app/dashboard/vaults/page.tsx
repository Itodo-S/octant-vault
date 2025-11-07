"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VaultCard } from "@/components/vault-card"
import { CreateVaultModal } from "@/components/create-vault-modal"

export default function VaultsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const vaults = [
    {
      id: "1",
      name: "OpenSea Creator Fund",
      description: "Funding for open source NFT marketplace contributors",
      totalAssets: "$482,000",
      yieldAPY: "12.5%",
      monthlyYield: "$5,025",
      contributors: 14,
      status: "active",
      deployer: "0x742d...8F3A",
    },
    {
      id: "2",
      name: "Climate DAO",
      description: "Sustainable development project funding",
      totalAssets: "$1,240,000",
      yieldAPY: "11.8%",
      monthlyYield: "$12,180",
      contributors: 32,
      status: "active",
      deployer: "0xB42E...2C1F",
    },
    {
      id: "3",
      name: "Dev Commons",
      description: "Core infrastructure and protocol development",
      totalAssets: "$756,000",
      yieldAPY: "13.2%",
      monthlyYield: "$8,316",
      contributors: 21,
      status: "active",
      deployer: "0xC123...9D8B",
    },
    {
      id: "4",
      name: "Public Health Initiatives",
      description: "Healthcare research and implementation projects",
      totalAssets: "$345,000",
      yieldAPY: "11.2%",
      monthlyYield: "$3,220",
      contributors: 8,
      status: "active",
      deployer: "0xD987...3F7E",
    },
  ]

  const filteredVaults = vaults.filter(
    (vault) =>
      vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vault.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVaults.map((vault) => (
          <VaultCard key={vault.id} vault={vault} />
        ))}
      </div>

      <CreateVaultModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  )
}
