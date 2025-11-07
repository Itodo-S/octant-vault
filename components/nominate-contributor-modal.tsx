"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface NominateContributorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NominateContributorModal({ open, onOpenChange }: NominateContributorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nominee: "",
    reason: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "Nomination Submitted",
        description: `Voting has started for ${formData.nominee}`,
      })
      onOpenChange(false)
      setFormData({ nominee: "", reason: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit nomination",
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
          <DialogTitle>Nominate Contributor</DialogTitle>
          <DialogDescription>Propose a contributor for higher allocation through community voting</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nominee">Contributor Name</Label>
            <Input
              id="nominee"
              placeholder="e.g., Alex Chen"
              value={formData.nominee}
              onChange={(e) => setFormData({ ...formData, nominee: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason for Nomination</Label>
            <textarea
              id="reason"
              placeholder="Describe why this contributor deserves higher allocation..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground resize-none h-24"
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
              {isLoading ? "Submitting..." : "Submit Nomination"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
