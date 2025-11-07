"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuadraticVotingCard } from "@/components/quadratic-voting-card"
import { NominateContributorModal } from "@/components/nominate-contributor-modal"

export default function VotingPage() {
  const [showNominateModal, setShowNominateModal] = useState(false)

  const activeVotings = [
    {
      id: "1",
      nominee: "Sarah Chen",
      role: "Protocol Engineer",
      description: "Exceptional work on smart contract auditing and security improvements",
      votesFor: 245,
      votesAgainst: 12,
      endDate: "2024-07-20",
      status: "active" as const,
      userVote: null,
    },
    {
      id: "2",
      nominee: "Marcus Johnson",
      role: "Community Lead",
      description: "Outstanding community engagement and organizing",
      votesFor: 189,
      votesAgainst: 5,
      endDate: "2024-07-18",
      status: "active" as const,
      userVote: null,
    },
  ]

  const pastVotings = [
    {
      id: "3",
      nominee: "Lisa Rodriguez",
      role: "Product Manager",
      description: "Consistent product roadmap execution",
      votesFor: 312,
      votesAgainst: 18,
      endDate: "2024-06-20",
      status: "approved" as const,
      userVote: "for",
    },
  ]

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

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeVotings.length})</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card className="bg-secondary/10 border-secondary/20 p-4">
            <p className="text-sm">
              <strong>Quadratic Voting:</strong> Your voting power increases with the square root of votes cast. Cost =
              n² where n is number of votes.
            </p>
          </Card>

          {activeVotings.map((voting) => (
            <QuadraticVotingCard key={voting.id} voting={voting} />
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastVotings.map((voting) => (
            <QuadraticVotingCard key={voting.id} voting={voting} />
          ))}
        </TabsContent>
      </Tabs>

      <NominateContributorModal open={showNominateModal} onOpenChange={setShowNominateModal} />
    </div>
  )
}
