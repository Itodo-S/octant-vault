"use client"

import { useState } from "react"
import { LandingHeader } from "@/components/landing-header"
import { LandingHero } from "@/components/landing-hero"
import { LandingFeatures } from "@/components/landing-features"
import { LandingCTA } from "@/components/landing-cta"
import { LandingFooter } from "@/components/landing-footer"
import { WalletConnectModal } from "@/components/wallet-connect-modal"

export default function Home() {
  const [showWalletModal, setShowWalletModal] = useState(false)

  return (
    <>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.05),transparent_50%)]" />
      <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <LandingHeader onConnectWallet={() => setShowWalletModal(true)} />
        <LandingHero onGetStarted={() => setShowWalletModal(true)} />
        <LandingFeatures />
        <LandingCTA onGetStarted={() => setShowWalletModal(true)} />
        <LandingFooter onGetStarted={() => setShowWalletModal(true)} />
      </main>
      <WalletConnectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </>
  )
}
