"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ScheduleDistributionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleDistributionModal({ open, onOpenChange }: ScheduleDistributionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    vault: "",
    date: "",
    time: "",
    method: "proportional",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "Distribution Scheduled",
        description: `Distribution scheduled for ${formData.date}`,
      })
      onOpenChange(false)
      setFormData({
        vault: "",
        date: "",
        time: "",
        method: "proportional",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule distribution",
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
          <DialogTitle>Schedule Distribution</DialogTitle>
          <DialogDescription>Set up an automated yield distribution to contributors</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="vault">Select Vault</Label>
            <Select value={formData.vault} onValueChange={(value) => setFormData({ ...formData, vault: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a vault" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opensea">OpenSea Creator Fund</SelectItem>
                <SelectItem value="climate">Climate DAO</SelectItem>
                <SelectItem value="dev">Dev Commons</SelectItem>
                <SelectItem value="health">Public Health Fund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date">Distribution Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="time">Distribution Time (UTC)</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="method">Distribution Method</Label>
            <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proportional">Proportional to Allocation</SelectItem>
                <SelectItem value="equal">Equal Split</SelectItem>
                <SelectItem value="voting">Voting-Weighted</SelectItem>
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
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90">
              {isLoading ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
