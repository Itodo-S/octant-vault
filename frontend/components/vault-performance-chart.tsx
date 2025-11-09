"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatEther, formatUnits } from "viem"
import { Address } from "viem"

interface VaultPerformanceChartProps {
  totalAssets?: bigint
  totalSupply?: bigint
  availableYield?: bigint
  vaultAddress?: Address
  assetDecimals?: number // Decimals for the asset (e.g., 6 for USDC, 18 for DAI/WETH)
}

export function VaultPerformanceChart({ totalAssets, totalSupply, availableYield, vaultAddress, assetDecimals = 18 }: VaultPerformanceChartProps) {
  // Calculate current yield if we have the data
  const currentYield = availableYield || (totalAssets && totalSupply && totalAssets > totalSupply ? totalAssets - totalSupply : 0n)
  
  // Since we don't have historical data on-chain, show current metrics
  // In production, you'd fetch this from events or a backend API
  const hasData = totalAssets !== undefined && totalSupply !== undefined

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center">
          <p className="text-foreground/70 mb-2">No performance data available yet</p>
          <p className="text-sm text-foreground/50">Performance metrics will appear after deposits and yield generation</p>
        </div>
      </div>
    )
  }

  // For now, show current yield metrics
  // In production, you'd fetch historical data from events or backend
  const currentMonth = new Date().toLocaleString('default', { month: 'short' })
  
  const data = [
    {
      month: currentMonth,
      yield: Number(formatUnits(currentYield || 0n, assetDecimals)),
      distributed: 0, // Would need to fetch from Distribution events
      totalAssets: Number(formatUnits(totalAssets || 0n, assetDecimals)),
    }
  ]

  // If there's no yield yet, show a message
  if (currentYield === 0n || !currentYield) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-center space-y-2">
          <p className="text-foreground/70">No yield generated yet</p>
          <p className="text-sm text-foreground/50">
            Current Assets: ${Number(formatUnits(totalAssets || 0n, assetDecimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-foreground/50">
            Yield will appear here once assets start generating returns
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="month" 
            stroke="var(--color-foreground)" 
            tick={{ fill: "var(--color-foreground)" }}
          />
          <YAxis 
            stroke="var(--color-foreground)" 
            tick={{ fill: "var(--color-foreground)" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "var(--color-card)", 
              border: "1px solid var(--color-border)", 
              borderRadius: "8px" 
            }} 
            formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          />
          <Legend />
          <Bar 
            dataKey="yield" 
            fill="var(--color-primary)" 
            name="Available Yield" 
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="distributed" 
            fill="var(--color-secondary)" 
            name="Distributed to Contributors" 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-sm text-foreground/70">Total Assets</p>
          <p className="text-lg font-bold">
            ${Number(formatUnits(totalAssets || 0n, assetDecimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-foreground/70">Available Yield</p>
          <p className="text-lg font-bold text-primary">
            ${Number(formatUnits(currentYield || 0n, assetDecimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}
