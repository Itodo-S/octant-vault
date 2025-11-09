"use client"

import { useState } from "react"
import type React from "react"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CreateVaultModal } from "@/components/create-vault-modal"
import { NetworkSwitchAlert } from "@/components/network-switch-alert"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar onCreateVault={() => setShowCreateModal(true)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <NetworkSwitchAlert />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <CreateVaultModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  )
}
