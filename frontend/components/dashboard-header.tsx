"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAccount, useDisconnect } from "wagmi"
import { useRouter } from "next/navigation"
import { LogOut, Home, Wallet } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function DashboardHeader() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only showing wallet info after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDisconnect = () => {
    disconnect()
    router.push("/")
  }

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex-1 flex items-center gap-4">
        <Input placeholder="Search vaults..." className="max-w-sm" />
      </div>
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" title="Go to Home">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        {mounted && isConnected && address && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary hidden sm:inline">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
        )}
        {mounted && isConnected && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDisconnect}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" title="Notifications">
          🔔
        </Button>
        <Button variant="ghost" size="icon" title="Settings">
          ⚙️
        </Button>
      </div>
    </header>
  )
}
