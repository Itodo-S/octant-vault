"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuadraticVotingCard } from "@/components/quadratic-voting-card"
import { NominateContributorModal } from "@/components/nominate-contributor-modal"
import { useAccount } from "wagmi"
import { useAllVotings, useVoting } from "@/hooks/use-voting"
import { useApiActiveVotings, useApiPastVotings } from "@/hooks/use-api"
import { formatEther } from "viem"

export default function VotingPage() {
  const [showNominateModal, setShowNominateModal] = useState(false)
  const { address } = useAccount()
  const { votingIds, votingCount, isLoading } = useAllVotings()
  const { data: apiActiveVotings, isLoading: isLoadingActive, refetch: refetchActiveVotings } = useApiActiveVotings()
  const { data: apiPastVotings, isLoading: isLoadingPast, refetch: refetchPastVotings } = useApiPastVotings()

  const activeVotings = useMemo(() => {
    if (apiActiveVotings?.success && apiActiveVotings.data) {
      return apiActiveVotings.data.map((v: any) => ({
        id: v.votingId.toString(),
        nominee: v.nomineeName,
        role: 'Contributor',
        description: v.description,
        votesFor: v.votesFor,
        votesAgainst: v.votesAgainst,
        endDate: new Date(v.endTime).toISOString().split('T')[0],
        status: 'active' as const,
        userVote: null,
      }))
    }
    return []
  }, [apiActiveVotings, votingIds])

  const pastVotings = useMemo(() => {
    if (apiPastVotings?.success && apiPastVotings.data) {
      return apiPastVotings.data.map((v: any) => ({
        id: v.votingId.toString(),
        nominee: v.nomineeName,
        role: 'Contributor',
        description: v.description,
        votesFor: v.votesFor,
        votesAgainst: v.votesAgainst,
        endDate: new Date(v.endTime).toISOString().split('T')[0],
        status: (v.isApproved ? 'approved' : 'rejected') as const,
        userVote: null,
      }))
    }
    return []
  }, [apiPastVotings])

  if (!address) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Please connect your wallet to view voting</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Voting</h1>
          <p className="text-foreground/70 mt-1">Quadratic voting for contributor allocation</p>
        </div>
        <Button onClick={() => setShowNominateModal(true)} className="bg-primary hover:bg-primary/90">
          + Nominate Contributor
        </Button>
      </div>

      {(isLoading && !apiActiveVotings && !apiPastVotings) ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70">Loading votings...</p>
          </CardContent>
        </Card>
      ) : votingCount === 0 && activeVotings.length === 0 && pastVotings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70 mb-4">No votings found</p>
            <Button onClick={() => setShowNominateModal(true)} className="bg-primary hover:bg-primary/90">
              Create First Voting
            </Button>
          </CardContent>
        </Card>
      ) : votingCount > 0 && activeVotings.length === 0 && pastVotings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-foreground/70 mb-2">Votes are being synced...</p>
            <p className="text-sm text-foreground/50 mb-4">
              Found {votingCount} vote(s) on-chain. Waiting for backend to sync.
            </p>
            <Button onClick={() => {
              refetchActiveVotings()
              refetchPastVotings()
            }} className="bg-primary hover:bg-primary/90">
              Refresh Votes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active ({activeVotings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastVotings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card className="bg-secondary/10 border-secondary/20 p-4">
              <p className="text-sm">
                <strong>Quadratic Voting:</strong> Your voting power increases with the square root of votes cast. Cost =
                n² where n is number of votes.
              </p>
            </Card>

            {activeVotings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-foreground/70">No active votings</CardContent>
              </Card>
            ) : (
              activeVotings.map((voting: any) => (
                <QuadraticVotingCard key={voting.id} voting={voting} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastVotings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-foreground/70">No past votings</CardContent>
              </Card>
            ) : (
              pastVotings.map((voting: any) => (
                <QuadraticVotingCard key={voting.id} voting={voting} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      <NominateContributorModal open={showNominateModal} onOpenChange={setShowNominateModal} />
    </div>
  )
}
