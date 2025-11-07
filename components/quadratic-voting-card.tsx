"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface VotingCardProps {
  voting: {
    id: string
    nominee: string
    role: string
    description: string
    votesFor: number
    votesAgainst: number
    endDate: string
    status: "active" | "approved" | "rejected"
    userVote: "for" | "against" | null
  }
}

export function QuadraticVotingCard({ voting }: VotingCardProps) {
  const [votes, setVotes] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const totalVotes = voting.votesFor + voting.votesAgainst
  const forPercentage = totalVotes > 0 ? (voting.votesFor / totalVotes) * 100 : 0

  const voteCost = votes * votes // Quadratic cost

  const handleVote = async (direction: "for" | "against") => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Vote Submitted",
        description: `Voted ${direction} with ${votes} votes (cost: ${voteCost} credits)`,
      })
      setVotes(0)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={`${voting.status === "active" ? "hover:shadow-lg transition" : ""}`}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{voting.nominee}</h3>
            <p className="text-sm text-foreground/70">{voting.role}</p>
            <p className="text-sm text-foreground/60 mt-2">{voting.description}</p>
          </div>
          <Badge variant={voting.status === "active" ? "default" : "secondary"}>{voting.status}</Badge>
        </div>

        {/* Voting Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Vote Results</span>
            <span className="text-foreground/70">{forPercentage.toFixed(1)}% approval</span>
          </div>
          <div className="flex gap-2 h-2 bg-muted rounded-full overflow-hidden">
            <div className="bg-primary transition-all" style={{ width: `${forPercentage}%` }} />
            <div className="bg-destructive flex-1" />
          </div>
          <div className="flex justify-between text-xs text-foreground/70">
            <span>{voting.votesFor} votes for</span>
            <span>{voting.votesAgainst} votes against</span>
          </div>
        </div>

        {/* Voting Interface */}
        {voting.status === "active" && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-foreground/70 block mb-2">Votes to Cast ({voteCost} credits)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={votes}
                  onChange={(e) => setVotes(Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/50 mt-1">
                  <span>0</span>
                  <span className="font-medium text-foreground/70">{votes}</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleVote("for")}
                disabled={isSubmitting || votes === 0}
                className="bg-primary hover:bg-primary/90"
              >
                Vote For
              </Button>
              <Button onClick={() => handleVote("against")} disabled={isSubmitting || votes === 0} variant="outline">
                Vote Against
              </Button>
            </div>
          </div>
        )}

        {/* Past Voting - Show Result */}
        {voting.status !== "active" && (
          <div className="text-sm text-center py-3 text-foreground/70">Voting ended on {voting.endDate}</div>
        )}
      </CardContent>
    </Card>
  )
}
