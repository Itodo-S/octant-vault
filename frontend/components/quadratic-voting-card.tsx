"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useVote } from "@/hooks/use-write-contracts"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { useApiActiveVotings, useApiPastVotings } from "@/hooks/use-api"
import { useVoting } from "@/hooks/use-voting"

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
  const { address } = useAccount()
  const { toast } = useToast()
  const router = useRouter()
  const { vote, isPending, isSuccess, hash } = useVote()
  const { refetch: refetchActiveVotings } = useApiActiveVotings()
  const { refetch: refetchPastVotings } = useApiPastVotings()
  const [votes, setVotes] = useState(0)
  
  // Fetch latest voting data from contract as source of truth
  const votingId = BigInt(voting.id)
  const { voting: contractVoting, refetch: refetchContractVoting } = useVoting(votingId)
  
  // Use contract data if available (more up-to-date), otherwise fall back to API data
  const effectiveVoting = useMemo(() => {
    if (contractVoting) {
      return {
        ...voting,
        votesFor: Number(contractVoting.votesFor),
        votesAgainst: Number(contractVoting.votesAgainst),
        isActive: contractVoting.isActive,
      }
    }
    return voting
  }, [contractVoting, voting])
  
  const totalVotes = effectiveVoting.votesFor + effectiveVoting.votesAgainst
  const forPercentage = totalVotes > 0 ? (effectiveVoting.votesFor / totalVotes) * 100 : 0

  const voteCost = votes * votes // Quadratic cost

  // Refetch votes after successful vote
  useEffect(() => {
    if (isSuccess && hash) {
      
      // Wait a bit for the transaction to be indexed, then refetch
      setTimeout(() => {
        
        // Refetch contract voting data first (most up-to-date)
        refetchContractVoting().catch((error) => {
        })
        
        // Also refetch API votes (for backend sync)
        Promise.all([
          refetchActiveVotings().catch((error) => {
          }),
          refetchPastVotings().catch((error) => {
          }),
        ]).then(() => {
        })
        
        // Also trigger a router refresh to update the page
        router.refresh()
      }, 2000) // Delay to ensure transaction is indexed
    }
  }, [isSuccess, hash, refetchContractVoting, refetchActiveVotings, refetchPastVotings, router])

  const handleVote = async (direction: "for" | "against") => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive",
      })
      return
    }

    if (votes <= 0 || votes > 10) {
      toast({
        title: "Error",
        description: "Please select 1-10 votes",
        variant: "destructive",
      })
      return
    }

    try {
      const votingId = BigInt(voting.id)
      await vote(votingId, votes, direction === "for")
      setVotes(0)
    } catch (error) {
      // Error is handled in the hook
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
            <span>{effectiveVoting.votesFor} votes for</span>
            <span>{effectiveVoting.votesAgainst} votes against</span>
          </div>
        </div>

        {/* Voting Interface */}
        {effectiveVoting.status === "active" && (
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
                disabled={isPending || votes === 0 || !address}
                className="bg-primary hover:bg-primary/90"
              >
                Vote For
              </Button>
              <Button 
                onClick={() => handleVote("against")} 
                disabled={isPending || votes === 0 || !address} 
                variant="outline"
              >
                Vote Against
              </Button>
            </div>
          </div>
        )}

        {/* Past Voting - Show Result */}
        {effectiveVoting.status !== "active" && (
          <div className="text-sm text-center py-3 text-foreground/70">Voting ended on {voting.endDate}</div>
        )}
      </CardContent>
    </Card>
  )
}
