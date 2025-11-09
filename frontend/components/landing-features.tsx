"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Shield, Users, Vote, Zap, Sparkles, DollarSign, Clock } from "lucide-react"

export function LandingFeatures() {
  const features = [
    {
      icon: TrendingUp,
      title: "Automatic Yield Generation",
      description: "Your funds automatically generate yield while staying safe. No complex setup required.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Your Money Stays Safe",
      description: "Only the yield is distributed. Your original deposits remain protected and can be withdrawn anytime.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Automated Team Payments",
      description: "Set up recurring payments to your contributors. The system handles everything automatically.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Vote,
      title: "Community Governance",
      description: "Let your community vote on who should receive funding. Fair and transparent decision-making.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: DollarSign,
      title: "Transparent Tracking",
      description: "See exactly where your funds go and how much each contributor receives. Full transparency.",
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      icon: Clock,
      title: "Scheduled Distributions",
      description: "Set up automatic monthly or weekly distributions. Your team gets paid on time, every time.",
      gradient: "from-indigo-500 to-violet-500",
    },
  ]

  return (
    <section id="features" className="relative px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <div className="relative">
      <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-purple-500 bg-clip-text text-transparent">
            Everything You Need
        </h2>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Simple tools to fund your team sustainably and transparently
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <Card 
              key={idx} 
                className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <CardContent className="p-8 relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
                  <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
        </div>
      </div>
    </section>
  )
}
