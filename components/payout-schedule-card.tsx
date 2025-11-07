"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface PayoutScheduleCardProps {
  payout: {
    id: string
    vault: string
    scheduledDate: string
    estimatedYield: string
    recipients: number
    status: "scheduled" | "pending_approval" | "processing"
  }
}

export function PayoutScheduleCard({ payout }: PayoutScheduleCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleExecute = async () => {
    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Distribution Executed",
        description: `${payout.estimatedYield} distributed to ${payout.recipients} contributors`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute distribution",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Distribution Approved",
        description: "Distribution has been approved and is scheduled",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve distribution",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">{payout.vault}</h3>
            <p className="text-sm text-foreground/70">Scheduled for {payout.scheduledDate}</p>
          </div>
          <Badge
            variant={
              payout.status === "scheduled" ? "default" : payout.status === "pending_approval" ? "secondary" : "outline"
            }
          >
            {payout.status === "scheduled"
              ? "Scheduled"
              : payout.status === "pending_approval"
                ? "Pending Approval"
                : "Processing"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
          <div>
            <p className="text-xs text-foreground/70">Estimated Yield</p>
            <p className="text-2xl font-bold text-secondary">{payout.estimatedYield}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/70">Recipients</p>
            <p className="text-2xl font-bold">{payout.recipients}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {payout.status === "pending_approval" && (
            <>
              <Button onClick={handleApprove} disabled={isProcessing} className="flex-1 bg-primary hover:bg-primary/90">
                Approve
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Reject
              </Button>
            </>
          )}
          {payout.status === "scheduled" && (
            <>
              <Button onClick={handleExecute} disabled={isProcessing} className="flex-1 bg-primary hover:bg-primary/90">
                {isProcessing ? "Executing..." : "Execute Now"}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Edit
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
