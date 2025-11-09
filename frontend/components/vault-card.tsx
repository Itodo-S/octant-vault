"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface VaultCardProps {
  vault: {
    id: string
    name: string
    description: string
    totalAssets: string
    yieldAPY: string
    monthlyYield: string
    contributors: number
    status: "active" | "paused" | "archived"
    deployer: string
  }
}

export function VaultCard({ vault }: VaultCardProps) {
  return (
    <Card className="hover:shadow-lg transition">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{vault.name}</CardTitle>
            <CardDescription className="mt-1">{vault.description}</CardDescription>
          </div>
          <Badge variant={vault.status === "active" ? "default" : "secondary"}>{vault.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-foreground/70">Total Assets</p>
            <p className="text-2xl font-bold">{vault.totalAssets}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/70">Yield APY</p>
            <p className="text-2xl font-bold text-secondary">{vault.yieldAPY}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/70">Monthly Yield</p>
            <p className="text-lg font-bold">{vault.monthlyYield}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/70">Contributors</p>
            <p className="text-lg font-bold">{vault.contributors}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-foreground/50 mb-3">Deployer: {vault.deployer}</p>
          <Link href={`/dashboard/vaults/${vault.id}`}>
            <Button className="w-full bg-transparent" variant="outline">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
