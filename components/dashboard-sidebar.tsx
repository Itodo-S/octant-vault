"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  onCreateVault?: () => void
}

export function DashboardSidebar({ onCreateVault }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/vaults", label: "Vaults", icon: "🏦" },
    { href: "/dashboard/contributors", label: "Contributors", icon: "👥" },
    { href: "/dashboard/voting", label: "Voting", icon: "🗳️" },
    { href: "/dashboard/impact", label: "Impact", icon: "🎯" },
    { href: "/dashboard/payouts", label: "Payouts", icon: "💸" },
  ]

  return (
    <aside className="w-64 bg-card border-r border-border overflow-y-auto">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">◆</span>
          </div>
          <span className="font-bold text-xl">Dashboard</span>
        </Link>

        <Button onClick={onCreateVault} className="w-full bg-primary hover:bg-primary/90 mb-8">
          + Create Vault
        </Button>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={cn("w-full justify-start", pathname === item.href && "bg-primary text-white")}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
