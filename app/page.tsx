"use client"

import { useState } from "react"
import { LandingHeader } from "@/components/landing-header"
import { LandingHero } from "@/components/landing-hero"
import { LandingFeatures } from "@/components/landing-features"
import { LandingCTA } from "@/components/landing-cta"
import { WalletConnectModal } from "@/components/wallet-connect-modal"

export default function Home() {
  const [showWalletModal, setShowWalletModal] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <LandingHeader onConnectWallet={() => setShowWalletModal(true)} />
      <LandingHero onGetStarted={() => setShowWalletModal(true)} />
      <LandingFeatures />
      <LandingCTA onGetStarted={() => setShowWalletModal(true)} />
      <WalletConnectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </main>
  )
}
