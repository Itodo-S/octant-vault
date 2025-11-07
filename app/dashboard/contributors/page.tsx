"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContributorList } from "@/components/contributor-list"
import { AddContributorModal } from "@/components/add-contributor-modal"

export default function ContributorsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const contributors = [
    {
      id: "1",
      name: "Alex Chen",
      role: "Lead Developer",
      wallet: "0xA1B2...C3D4",
      status: "active",
      totalEarned: "$18,500",
      monthlyAllocation: "$2,100",
      joinDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Maria Garcia",
      role: "Designer",
      wallet: "0xB2C3...D4E5",
      status: "active",
      totalEarned: "$12,300",
      monthlyAllocation: "$1,500",
      joinDate: "2024-02-20",
    },
    {
      id: "3",
      name: "James Wilson",
      role: "Community Manager",
      wallet: "0xC3D4...E5F6",
      status: "active",
      totalEarned: "$8,900",
      monthlyAllocation: "$1,000",
      joinDate: "2024-03-10",
    },
  ]

  const filteredContributors = contributors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contributors</h1>
          <p className="text-foreground/70 mt-1">Manage team members and allocations</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90">
          + Add Contributor
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search contributors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredContributors.length})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ContributorList contributors={filteredContributors} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <ContributorList contributors={filteredContributors.filter((c) => c.status === "active")} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center text-foreground/70">No pending contributor requests</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddContributorModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  )
}
