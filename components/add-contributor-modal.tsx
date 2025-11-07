"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface AddContributorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddContributorModal({ open, onOpenChange }: AddContributorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    wallet: "",
    monthlyAllocation: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "Contributor Added",
        description: `${formData.name} has been added to the vault`,
      })
      onOpenChange(false)
      setFormData({ name: "", role: "", wallet: "", monthlyAllocation: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contributor",
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
          <DialogTitle>Add Contributor</DialogTitle>
          <DialogDescription>Add a new team member to receive yield allocations</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g., Alex Chen"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              placeholder="e.g., Lead Developer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="wallet">Wallet Address</Label>
            <Input
              id="wallet"
              placeholder="0x..."
              value={formData.wallet}
              onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="allocation">Monthly Allocation (USDC)</Label>
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
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90">
              {isLoading ? "Adding..." : "Add Contributor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
