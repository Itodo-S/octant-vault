"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface WithdrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const { toast } = useToast()

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "Withdrawal Successful",
        description: `${amount} USDC withdrawn from vault`,
      })
      onOpenChange(false)
      setAmount("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to withdraw",
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
          <DialogTitle>Withdraw from Vault</DialogTitle>
          <DialogDescription>Remove funds from the vault</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (vUSDC)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              required
            />
            <p className="text-xs text-foreground/50 mt-2">Your Balance: 120.50 vUSDC</p>
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
            <Button type="submit" disabled={isLoading || !amount} className="flex-1 bg-primary hover:bg-primary/90">
              {isLoading ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
