"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Users, DollarSign } from "lucide-react"
import Link from "next/link"

interface LandingHeroProps {
  onGetStarted: () => void
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 via-background to-cyan-500/10 animate-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(120,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_70%)]" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 mb-8 animate-fade-in backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-primary">Sustainable Funding Platform</p>
          </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-foreground via-primary to-purple-500 bg-clip-text text-transparent">
                Fund Your Team
            </span>
            <br />
              <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                with Yield
              </span>
          </h1>

            <p className="text-xl md:text-2xl text-foreground/70 mb-10 text-balance max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-100">
              Create sustainable income streams for your contributors. 
            <br />
              <span className="text-lg text-foreground/60">Your funds stay safe while generating yield for your team.</span>
          </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12 animate-fade-in-up delay-200">
            <Button 
              onClick={onGetStarted} 
              size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all text-white"
            >
                Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
                className="h-14 px-8 text-lg font-semibold border-2 hover:bg-accent/50 backdrop-blur-sm"
              asChild
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-300">
              <div className="flex flex-col items-center lg:items-start p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 shadow-lg">
                <Shield className="w-8 h-8 text-primary mb-3" />
                <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">100%</div>
                <div className="text-sm text-foreground/60">Protected</div>
              </div>
              <div className="flex flex-col items-center lg:items-start p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 shadow-lg">
              <TrendingUp className="w-8 h-8 text-primary mb-3" />
                <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Auto</div>
                <div className="text-sm text-foreground/60">Yield</div>
              </div>
              <div className="flex flex-col items-center lg:items-start p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/50 shadow-lg">
                <Users className="w-8 h-8 text-primary mb-3" />
                <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Team</div>
                <div className="text-sm text-foreground/60">First</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block animate-fade-in-up delay-200">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Vault Balance</div>
                      <div className="text-3xl font-bold text-primary">$125,000</div>
                    </div>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                      <div className="text-sm text-foreground/60 mb-1">Monthly Yield</div>
                      <div className="text-xl font-bold text-primary">$2,500</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                      <div className="text-sm text-foreground/60 mb-1">Contributors</div>
                      <div className="text-xl font-bold text-cyan-600">12</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-foreground/60">APY</div>
                      <div className="text-sm font-semibold text-green-600">12.5%</div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-3/4" />
                    </div>
                  </div>
                </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
          animation-fill-mode: both;
        }
        .delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        .delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }
      `}</style>
    </section>
  )
}
