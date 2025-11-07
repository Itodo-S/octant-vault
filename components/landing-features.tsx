"use client"

import { Card, CardContent } from "@/components/ui/card"

export function LandingFeatures() {
  const features = [
    {
      icon: "💰",
      title: "Automated Yield Distribution",
      description: "Vaults automatically distribute earned yield as recurring salaries to contributors",
    },
    {
      icon: "🎯",
      title: "Impact Transparency",
      description: "On-chain metrics showing exactly how much yield funded which projects and impact achieved",
    },
    {
      icon: "🔓",
      title: "Permissionless Expansion",
      description: "Any organization can clone and customize vaults for their community",
    },
    {
      icon: "🗳️",
      title: "Community Governance",
      description: "Quadratic voting lets communities decide who deserves allocation",
    },
    {
      icon: "🛡️",
      title: "Principal Protection",
      description: "Only yield is distributed - original deposits remain intact forever",
    },
    {
      icon: "⚡",
      title: "Octant Integration",
      description: "Built on ERC-4626 for seamless integration with Octant ecosystem",
    },
  ]

  return (
    <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
        <p className="text-foreground/70 max-w-2xl mx-auto">Everything you need to fund public goods sustainably</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <Card key={idx} className="hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
