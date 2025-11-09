"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useWithdraw } from "@/hooks/use-write-contracts"
import { useAccount } from "wagmi"
import { Address } from "viem"
import { useRouter } from "next/navigation"
import { useVaultShareBalance } from "@/hooks/use-balances"
import { Skeleton } from "@/components/ui/skeleton"

interface WithdrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaultAddress?: Address
}

export function WithdrawModal({ open, onOpenChange, vaultAddress }: WithdrawModalProps) {
  const { address } = useAccount()
  const { toast } = useToast()
  const router = useRouter()
  const { withdraw, isPending } = useWithdraw()
  const [amount, setAmount] = useState("")
  
  const { balance, balanceFormatted, isLoading: isLoadingBalance, hasBalance } = useVaultShareBalance(vaultAddress)

  const handleWithdraw = async (e: React.FormEvent) => {
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

    if (amountNum > balanceNum) {
      toast({
        title: "Error",
        description: `Insufficient balance. You have ${balanceFormatted} shares`,
        variant: "destructive",
      })
      return
    }

    // Allow withdrawal attempt even with 0 balance - the contract will handle the error
    // This allows users to see the error from the contract itself

    try {
      await withdraw(vaultAddress, amount, address, address)
      onOpenChange(false)
      setAmount("")
      router.refresh()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw from Vault</DialogTitle>
          <DialogDescription>Remove funds from the vault</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="mb-2 block">Amount (vUSDC)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
            {isLoadingBalance ? (
              <Skeleton className="h-4 w-32 mt-2" />
            ) : (
              <p className="text-xs text-foreground/50 mt-2">
                Your Balance: {balanceFormatted} shares
              </p>
            )}
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>You will receive</span>
              <span className="font-medium">
                {amount ? (Number.parseFloat(amount) * 1.02).toFixed(2) : "0.00"} USDC
              </span>
            </div>
            <div className="flex justify-between text-xs text-foreground/60">
              <span>Exchange Rate</span>
              <span>1 vUSDC = 1.02 USDC</span>
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
              disabled={isPending || !amount || !vaultAddress || Number.parseFloat(amount) <= 0} 
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isPending ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
