"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface LandingCTAProps {
  onGetStarted: () => void
}

export function LandingCTA({ onGetStarted }: LandingCTAProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Impact?</h2>
          <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
            Join nonprofits and open source projects funding their teams through sustainable DeFi yield
          </p>
          <Button onClick={onGetStarted} className="bg-primary hover:bg-primary/90 h-12 px-8 text-base">
            Launch Dashboard
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
