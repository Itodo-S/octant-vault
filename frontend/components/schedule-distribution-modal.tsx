"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useScheduleDistribution } from "@/hooks/use-write-contracts"
import { useAccount } from "wagmi"
import { Address } from "viem"
import { useRouter } from "next/navigation"
import { useAllVaults } from "@/hooks/use-vaults"
import { useApiUpcomingDistributions, useApiRecentDistributions } from "@/hooks/use-api"
import { useEffect } from "react"
import { apiClient } from "@/lib/api"

interface ScheduleDistributionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaultAddress?: Address
}

export function ScheduleDistributionModal({ open, onOpenChange, vaultAddress }: ScheduleDistributionModalProps) {
  const { address } = useAccount()
  const { toast } = useToast()
  const router = useRouter()
  const { scheduleDistribution, isPending, isSuccess, hash } = useScheduleDistribution()
  const { vaults } = useAllVaults()
  const { refetch: refetchUpcoming } = useApiUpcomingDistributions()
  const { refetch: refetchRecent } = useApiRecentDistributions()
  const [formData, setFormData] = useState({
    vault: vaultAddress?.toString() || "",
    date: "",
    time: "",
    method: "0", // 0 = Proportional, 1 = Equal, 2 = VotingWeighted
  })

  // Refetch distributions after successful scheduling
  useEffect(() => {
    if (isSuccess && hash) {
      
      // Wait a bit for the transaction to be indexed, then sync and refetch
      setTimeout(async () => {
        
        // First, trigger backend sync
        try {
          const syncResult = await apiClient.syncDistributions()
        } catch (error) {
        }
        
        // Then refetch both upcoming and recent distributions
        Promise.all([
          refetchUpcoming().catch((error) => {
          }),
          refetchRecent().catch((error) => {
          }),
        ]).then(() => {
        })
        
        // Also trigger a router refresh to update the page
        router.refresh()
        
        // Close modal and reset form
        onOpenChange(false)
        setFormData({
          vault: vaultAddress?.toString() || "",
          date: "",
          time: "",
          method: "0",
        })
        
      }, 3000) // Delay to ensure transaction is indexed
    }
  }, [isSuccess, hash, refetchUpcoming, refetchRecent, router, onOpenChange, vaultAddress])

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

    const selectedVault = formData.vault || vaultAddress
    if (!selectedVault) {
      toast({
        title: "Error",
        description: "Please select a vault",
        variant: "destructive",
      })
      return
    }

    if (!formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please select date and time",
        variant: "destructive",
      })
      return
    }

    // Convert date and time to Unix timestamp
    const dateTime = new Date(`${formData.date}T${formData.time}`)
    const scheduledTime = Math.floor(dateTime.getTime() / 1000)

    // Validate scheduled time is in the future
    if (scheduledTime <= Math.floor(Date.now() / 1000)) {
      toast({
        title: "Error",
        description: "Scheduled time must be in the future",
        variant: "destructive",
      })
      return
    }

    try {
      await scheduleDistribution(
        selectedVault as Address,
        scheduledTime,
        Number.parseInt(formData.method)
      )
      // Don't close modal here - wait for transaction confirmation in useEffect
    } catch (error) {
      // Error is handled in the hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Distribution</DialogTitle>
          <DialogDescription>Set up an automated yield distribution to contributors</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!vaultAddress && vaults && vaults.length > 0 && (
            <div>
              <Label htmlFor="vault" className="mb-2 block">Select Vault</Label>
              <Select value={formData.vault} onValueChange={(value) => setFormData({ ...formData, vault: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vault" />
                </SelectTrigger>
                <SelectContent>
                  {vaults.map((vault) => (
                    <SelectItem key={vault} value={vault}>
                      {vault.slice(0, 6)}...{vault.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="date" className="mb-2 block">Distribution Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="time" className="mb-2 block">Distribution Time (UTC)</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="method" className="mb-2 block">Distribution Method</Label>
            <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Proportional to Allocation</SelectItem>
                <SelectItem value="1">Equal Split</SelectItem>
                <SelectItem value="2">Voting-Weighted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">Preview</p>
            <p className="text-foreground/70">
              {formData.vault && formData.date
                ? `Distribution on ${formData.date} to all contributors in ${formData.vault || "selected vault"}`
                : "Fill in the form to see preview"}
            </p>
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
              disabled={isPending || !formData.vault || !formData.date || !formData.time} 
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isPending ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
