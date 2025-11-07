"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const wallets = [
    { name: "MetaMask", icon: "🦊" },
    { name: "Coinbase Wallet", icon: "⬜" },
    { name: "WalletConnect", icon: "🔵" },
  ]

  const handleConnect = async (walletName: string) => {
    setIsConnecting(true)
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "Connected",
        description: `${walletName} connected successfully`,
      })
      onOpenChange(false)
      // Redirect to dashboard
      window.location.href = "/dashboard"
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to Octant Vaults</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => handleConnect(wallet.name)}
              disabled={isConnecting}
              variant="outline"
              className="w-full h-12 justify-center"
            >
              <span className="text-2xl mr-3">{wallet.icon}</span>
              <span className="text-base">{wallet.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
