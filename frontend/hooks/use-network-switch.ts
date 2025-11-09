'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { CONTRACTS } from '@/lib/contracts'

/**
 * Hook to ensure user is on Base Sepolia network
 * Automatically switches if on wrong network
 */
export function useNetworkSwitch() {
	const { chainId } = useChainId()
	const { switchChain, isPending: isSwitching } = useSwitchChain()
	const { isConnected } = useAccount()
	const { toast } = useToast()

	useEffect(() => {
		if (!isConnected) return

		if (chainId !== CONTRACTS.CHAIN_ID) {
			toast({
				title: 'Wrong Network',
				description: `Please switch to Base Sepolia (Chain ID: ${CONTRACTS.CHAIN_ID})`,
				variant: 'destructive',
			})

			if (switchChain) {
				try {
					switchChain({ chainId: CONTRACTS.CHAIN_ID })
				} catch (error) {
					// Failed to switch chain
				}
			}
		}
	}, [chainId, isConnected, switchChain, toast])

	return {
		isCorrectNetwork: chainId === CONTRACTS.CHAIN_ID,
		chainId,
		targetChainId: CONTRACTS.CHAIN_ID,
		isSwitching,
		switchToBaseSepolia: () => {
			if (switchChain) {
				switchChain({ chainId: CONTRACTS.CHAIN_ID })
			}
		},
	}
}

