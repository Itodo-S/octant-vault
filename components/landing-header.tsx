"use client"

import { Button } from "@/components/ui/button"

interface LandingHeaderProps {
  onConnectWallet: () => void
}

export function LandingHeader({ onConnectWallet }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">◆</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline">Octant Vaults</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-foreground/70 hover:text-foreground transition">
            Features
          </a>
          <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition">
            How it Works
          </a>
          <a href="#impact" className="text-foreground/70 hover:text-foreground transition">
            Impact
          </a>
        </nav>
        <Button onClick={onConnectWallet} className="bg-primary hover:bg-primary/90">
          Connect Wallet
        </Button>
      </div>
    </header>
  )
}
