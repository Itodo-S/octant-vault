"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useDeposit } from "@/hooks/use-write-contracts"
import { useAccount } from "wagmi"
import { Address } from "viem"
import { useRouter } from "next/navigation"
import { useAssetBalance } from "@/hooks/use-balances"
import { getAssetAddress } from "@/lib/assets"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"
import { useVaultInfo } from "@/hooks/use-vaults"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaultAddress?: Address
  assetName?: string
  assetAddress?: Address // Vault's actual asset address (use this instead of converting from name)
}

export function DepositModal({ open, onOpenChange, vaultAddress, assetName = "USDC", assetAddress: vaultAssetAddress }: DepositModalProps) {
  const { address } = useAccount()
  const { toast } = useToast()
  const router = useRouter()
  const { deposit, isPending, isSuccess, hash } = useDeposit()
  const [amount, setAmount] = useState("")
  
  const assetAddress = (vaultAssetAddress || getAssetAddress(assetName)) as Address
  const { balance, balanceFormatted, isLoading: isLoadingBalance, hasBalance } = useAssetBalance(
    assetAddress,
    assetName
  )
  
  const { refetch: refetchVaultInfo } = useVaultInfo(vaultAddress)
  
  useEffect(() => {
    if (isSuccess && vaultAddress) {
      
      // Wait a bit for the transaction to be indexed, then refetch
      const timer = setTimeout(() => {
        
        // Refetch vault info
        refetchVaultInfo().then((result) => {
        }).catch((error) => {
        })
        
        // Also trigger a router refresh to update the page
        router.refresh()
        
        // Close modal and reset form
        onOpenChange(false)
        setAmount("")
        
      }, 3000) // Increased delay to ensure transaction is indexed
      
      return () => clearTimeout(timer)
    }
  }, [isSuccess, isPending, vaultAddress, refetchVaultInfo, router, onOpenChange])

  const handleDeposit = async (e: React.FormEvent) => {
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
        description: "Vault address is required",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    const amountNum = Number.parseFloat(amount)

    const balanceNum = Number.parseFloat(balanceFormatted)

    // Only check balance for ERC20 tokens, not for native ETH
    if (assetName !== 'ETH' && amountNum > balanceNum) {
      toast({
        title: "Error",
        description: `Insufficient balance. You have ${balanceFormatted} ${assetName}`,
        variant: "destructive",
      })
      return
    }

    try {
            await deposit(vaultAddress, assetName, amount, address, assetAddress)
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
          <DialogTitle>Deposit to Vault</DialogTitle>
          <DialogDescription>Add funds to earn yield and support contributors</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="mb-2 block">
              Amount ({assetName})
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
            <div className="mt-2 space-y-1">
                  {isLoadingBalance ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <p className="text-xs text-foreground/50">
                      Balance: {balanceFormatted} {assetName}
                    </p>
              )}
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>You will receive</span>
              <span className="font-medium">
                {amount ? (Number.parseFloat(amount) * 0.98).toFixed(2) : "0.00"} vUSDC
              </span>
            </div>
            <div className="flex justify-between text-xs text-foreground/60">
              <span>APY</span>
              <span>12.5%</span>
            </div>
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
              disabled={
                isPending || 
                !amount || 
                !vaultAddress || 
                (assetName !== 'ETH' && (!hasBalance || Number.parseFloat(amount) > Number.parseFloat(balanceFormatted)))
              } 
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isPending ? "Processing..." : "Deposit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
