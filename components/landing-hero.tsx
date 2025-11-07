"use client"

import { Button } from "@/components/ui/button"

interface LandingHeroProps {
  onGetStarted: () => void
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block px-4 py-2 rounded-full bg-secondary/20 border border-secondary/50 mb-6">
          <p className="text-sm font-medium text-secondary">Sustainable Funding for Public Goods</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
          Yield-Powered Salaries for Nonprofit Builders
        </h1>
        <p className="text-xl text-foreground/70 mb-8 text-balance max-w-2xl mx-auto">
          Deploy ERC-4626 vaults that stream sustainable income to your team. Combine transparent impact metrics with
          permissionless expansion.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onGetStarted} className="bg-primary hover:bg-primary/90 h-12 px-8 text-base">
            Launch App
          </Button>
          <Button variant="outline" className="h-12 px-8 text-base bg-transparent">
            View Docs
          </Button>
        </div>
      </div>
    </section>
  )
}
