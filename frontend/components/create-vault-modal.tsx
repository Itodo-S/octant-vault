"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useCreateVault } from "@/hooks/use-write-contracts"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"

interface CreateVaultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVaultModal({ open, onOpenChange }: CreateVaultModalProps) {
  const { address } = useAccount()
  const { toast } = useToast()
  const router = useRouter()
  const { createVault, isPending } = useCreateVault()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    asset: "USDC",
    strategy: "spark", // Default to "spark" to match the vault list filter
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    try {
      await createVault(formData.asset, formData.name, formData.description, formData.strategy === "spark")
      onOpenChange(false)
      setFormData({ name: "", description: "", asset: "USDC", strategy: "spark" })
      // Refresh the page to show new vault
      router.refresh()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Vault</DialogTitle>
          <DialogDescription>Deploy a new ERC-4626 vault for your organization</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2 block">Vault Name</Label>
            <Input
              id="name"
              placeholder="e.g., Climate DAO Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of the vault's purpose"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="asset" className="mb-2 block">Asset</Label>
            <Select value={formData.asset} onValueChange={(value) => setFormData({ ...formData, asset: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="DAI">DAI</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="strategy" className="mb-2 block">Vault Type</Label>
            <Select value={formData.strategy} onValueChange={(value) => setFormData({ ...formData, strategy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Vault</SelectItem>
                <SelectItem value="regular">Spark Vault (Spark Protocol Integration)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-foreground/50 mt-1">
              {formData.strategy === "spark" 
                ? "Uses Spark's curated yield for yield generation"
                : "Standard ERC-4626 vault"}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.name || !formData.description} className="flex-1 bg-primary hover:bg-primary/90">
              {isPending ? "Creating..." : "Create Vault"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
