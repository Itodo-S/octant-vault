"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CreateVaultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVaultModal({ open, onOpenChange }: CreateVaultModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    asset: "USDC",
    strategy: "yield-optimization",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "Vault Created",
        description: `${formData.name} has been deployed successfully`,
      })
      onOpenChange(false)
      setFormData({ name: "", description: "", asset: "USDC", strategy: "yield-optimization" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create vault",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
            <Label htmlFor="name">Vault Name</Label>
            <Input
              id="name"
              placeholder="e.g., Climate DAO Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of the vault's purpose"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="asset">Asset</Label>
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
            <Label htmlFor="strategy">Yield Strategy</Label>
            <Select value={formData.strategy} onValueChange={(value) => setFormData({ ...formData, strategy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yield-optimization">Yield Optimization (Uniswap + Yearn)</SelectItem>
                <SelectItem value="aave-stable">Aave Stable Farming</SelectItem>
                <SelectItem value="curve-lp">Curve LP Rewards</SelectItem>
                <SelectItem value="lido-staking">Lido Liquid Staking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90">
              {isLoading ? "Creating..." : "Create Vault"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
