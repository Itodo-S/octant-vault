"use client"

import { Button } from "@/components/ui/button"
import { useAccount, useDisconnect } from "wagmi"
import { useRouter } from "next/navigation"
import { Wallet, LogOut } from "lucide-react"

interface LandingHeaderProps {
  onConnectWallet: () => void
}

export function LandingHeader({ onConnectWallet }: LandingHeaderProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  const handleDisconnect = () => {
    disconnect()
  }

  const handleDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <header className="sticky top-0 z-50 bg-background/20 dark:bg-slate-900/20 backdrop-blur-2xl border-b border-white/10 dark:border-white/5 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">◆</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            OctantVault
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <a 
            href="#features" 
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-200 relative group"
          >
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full transition-all duration-200" />
          </a>
          <a 
            href="#how-it-works" 
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-200 relative group"
          >
            How it Works
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full transition-all duration-200" />
          </a>
          <a 
            href="#impact" 
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-200 relative group"
          >
            Impact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full transition-all duration-200" />
          </a>
        </nav>
        {isConnected && address ? (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleDashboard}
              className="hidden sm:flex backdrop-blur-sm bg-white/5 dark:bg-white/5 border-white/10 hover:bg-white/10 dark:hover:bg-white/10 hover:border-white/20 transition-all"
            >
              Dashboard
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 backdrop-blur-sm hover:from-primary/15 hover:to-purple-500/15 transition-all">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDisconnect}
              className="h-9 w-9 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onConnectWallet} 
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all text-white"
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  )
}
