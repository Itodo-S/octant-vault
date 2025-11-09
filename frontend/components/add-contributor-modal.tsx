"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAddContributor } from "@/hooks/use-write-contracts"
import { useAccount } from "wagmi"
import { Address } from "viem"
import { useRouter } from "next/navigation"
import { useVaultContributors } from "@/hooks/use-contributors"
import { useApiContributors } from "@/hooks/use-api"

interface AddContributorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaultAddress?: string
}

export function AddContributorModal({ open, onOpenChange, vaultAddress }: AddContributorModalProps) {
  const { address } = useAccount()
  const { toast } = useToast()
  const router = useRouter()
  const { addContributor, isPending, isSuccess, hash } = useAddContributor()
  const { refetch: refetchContractContributors } = useVaultContributors(vaultAddress as Address | undefined)
  const { refetch: refetchApiContributors } = useApiContributors(vaultAddress as Address | undefined)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    wallet: "",
    monthlyAllocation: "",
  })

  useEffect(() => {
    if (hash && !isPending && !isSuccess && vaultAddress) {
      
      // Show error message
      toast({
        title: 'Transaction Failed',
        description: 'The transaction was reverted. You may not have permission to add contributors (only the ContributorRegistry owner can add contributors).',
        variant: 'destructive',
      })
      
      // Close modal after showing error
      setTimeout(() => {
        onOpenChange(false)
        setFormData({ name: "", role: "", wallet: "", monthlyAllocation: "" })
      }, 3000)
      
      return
    }
    
    if (isSuccess && vaultAddress) {
      
      // Wait a bit for the transaction to be indexed, then refetch
      const timer = setTimeout(() => {
        
        // Refetch both contract and API contributors
        Promise.all([
          refetchContractContributors().catch((error) => {
          }),
          refetchApiContributors().catch((error) => {
          }),
        ]).then((results) => {
        })
        
        // Also trigger a router refresh to update the page
        router.refresh()
        
        // Close modal and reset form
        onOpenChange(false)
        setFormData({ name: "", role: "", wallet: "", monthlyAllocation: "" })
        
      }, 3000) // Delay to ensure transaction is indexed
      
      return () => clearTimeout(timer)
    }
  }, [isSuccess, isPending, hash, vaultAddress, refetchContractContributors, refetchApiContributors, router, onOpenChange])

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

    if (!vaultAddress) {
      toast({
        title: "Error",
        description: "Please select a vault first",
        variant: "destructive",
      })
      return
    }

    // Validate wallet address
    if (!formData.wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({
        title: "Error",
        description: "Invalid wallet address format",
        variant: "destructive",
      })
      return
    }

    try {
      await addContributor(
        vaultAddress as Address,
        formData.wallet as Address,
        formData.name,
        formData.role,
        formData.monthlyAllocation
      )
      // Don't close modal immediately - wait for transaction confirmation
      // The useEffect will handle refetching and closing
    } catch (error) {
      // Error is handled in the hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contributor</DialogTitle>
          <DialogDescription>Add a new team member to receive yield allocations</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2 block">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g., Alex Chen"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="role" className="mb-2 block">Role</Label>
            <Input
              id="role"
              placeholder="e.g., Lead Developer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="wallet" className="mb-2 block">Wallet Address</Label>
            <Input
              id="wallet"
              placeholder="0x..."
              value={formData.wallet}
              onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="allocation" className="mb-2 block">Monthly Allocation (USDC)</Label>
            <Input
              id="allocation"
              type="number"
              placeholder="2000"
              value={formData.monthlyAllocation}
              onChange={(e) => setFormData({ ...formData, monthlyAllocation: e.target.value })}
              step="100"
              required
            />
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
            <Button 
              type="submit" 
              disabled={isPending || !vaultAddress || !formData.name || !formData.role || !formData.wallet || !formData.monthlyAllocation} 
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isPending ? "Adding..." : "Add Contributor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
