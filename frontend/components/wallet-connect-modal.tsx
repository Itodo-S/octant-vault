"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useConnect, useDisconnect, useAccount } from "wagmi"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (isConnected && address) {
      toast({
        title: "Connected",
        description: `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
      onOpenChange(false)
      router.push("/dashboard")
    }
  }, [isConnected, address, toast, onOpenChange, router])

  const handleConnect = (connector: any) => {
    try {
      connect({ connector })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to OctantVault</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => handleConnect(connector)}
              disabled={isPending}
              variant="outline"
              className="w-full h-12 justify-center"
            >
              <span className="text-base">{connector.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
