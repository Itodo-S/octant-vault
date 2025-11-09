"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

interface LandingCTAProps {
  onGetStarted: () => void
}

export function LandingCTA({ onGetStarted }: LandingCTAProps) {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/15 via-background to-cyan-500/15" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.2),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15),transparent_50%)]" />
      
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 mb-8 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium text-primary">Ready to Get Started?</p>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            <span className="bg-gradient-to-r from-foreground via-primary to-purple-500 bg-clip-text text-transparent">
              Start Funding Your Team
            </span>
          <br />
            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Today
          </span>
        </h2>
        
          <p className="text-xl text-foreground/70 mb-10 text-balance max-w-2xl mx-auto leading-relaxed">
            Create your first vault and start generating sustainable income for your contributors. 
            <br />
            <span className="text-lg text-foreground/60">Simple, safe, and transparent.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            onClick={onGetStarted} 
            size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all text-white"
          >
              Create Your Vault
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
              className="h-14 px-8 text-lg font-semibold border-2 hover:bg-accent/50 backdrop-blur-sm"
            asChild
          >
              <Link href="#features">See How It Works</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 shadow-lg">
            <Shield className="w-8 h-8 text-primary mb-3" />
              <div className="font-semibold mb-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Safe & Secure</div>
              <div className="text-sm text-foreground/60 text-center">Your deposits stay protected</div>
          </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 shadow-lg">
            <TrendingUp className="w-8 h-8 text-primary mb-3" />
              <div className="font-semibold mb-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Auto Yield</div>
              <div className="text-sm text-foreground/60 text-center">Earn while you fund</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 shadow-lg">
              <Users className="w-8 h-8 text-primary mb-3" />
              <div className="font-semibold mb-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Team First</div>
              <div className="text-sm text-foreground/60 text-center">Built for contributors</div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}
