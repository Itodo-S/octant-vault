'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { CONTRACTS } from '@/lib/contracts'

export function NetworkSwitchAlert() {
	const { isConnected } = useAccount()
	const chainId = useChainId()
	const { switchChain, isPending: isSwitching } = useSwitchChain()

	if (!isConnected || chainId === CONTRACTS.CHAIN_ID) {
		return null
	}

	return (
		<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 m-4">
			<div className="flex items-start gap-3">
				<AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
				<div className="flex-1">
					<h3 className="font-semibold text-destructive mb-1">Wrong Network</h3>
					<p className="text-sm text-foreground/70 mb-3">
						You are connected to Chain ID: {chainId}. Please switch to Base Sepolia (Chain ID: {CONTRACTS.CHAIN_ID}).
					</p>
					<Button
						onClick={() => switchChain({ chainId: CONTRACTS.CHAIN_ID })}
						disabled={isSwitching}
						size="sm"
						variant="outline"
						className="bg-background"
					>
						{isSwitching ? 'Switching...' : 'Switch to Base Sepolia'}
					</Button>
				</div>
			</div>
		</div>
	)
}

