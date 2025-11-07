"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DashboardHeader() {
  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex-1 flex items-center gap-4">
        <Input placeholder="Search vaults..." className="max-w-sm" />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          🔔
        </Button>
        <Button variant="ghost" size="icon">
          ⚙️
        </Button>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">U</div>
      </div>
    </header>
  )
}
