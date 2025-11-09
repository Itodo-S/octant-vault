'use client'

import { useReadContract } from 'wagmi'
import { useContributorRegistry } from './use-contracts'
import { Address } from 'viem'

export interface Contributor {
	vault: Address
	wallet: Address
	name: string
	role: string
	monthlyAllocation: bigint
	totalEarned: bigint
	isActive: boolean
}

export function useVaultContributors(vaultAddress?: Address) {
	const { address: registryAddress, abi } = useContributorRegistry()
	
	const { data: result, isLoading, refetch } = useReadContract({
		address: registryAddress,
		abi,
		functionName: 'getVaultContributors',
		args: vaultAddress ? [vaultAddress] : undefined,
		query: {
			enabled: !!vaultAddress,
			refetchInterval: 5000, // Refetch every 5 seconds to catch new contributors
		},
	})

	// getVaultContributors returns a tuple: (address[] wallets, Contributor[] contributorData)
	// When wagmi/viem returns a tuple, it's an array: [wallets, contributorData]
	let wallets: Address[] | undefined = undefined
	let contributorData: Contributor[] | undefined = undefined

	if (result) {
		if (Array.isArray(result) && result.length === 2) {
			// It's a tuple: [wallets, contributorData]
			wallets = result[0] as Address[]
			contributorData = result[1] as Contributor[]
		} else if (Array.isArray(result)) {
			// Fallback: assume it's just the wallets array
			wallets = result as Address[]
		}
	}

	return {
		contributors: wallets,
		contributorData,
		isLoading,
		refetch,
	}
}

export function useContributorInfo(vaultAddress: Address, contributorAddress: Address) {
	const { address: registryAddress, abi } = useContributorRegistry()
	
	const { data: contributor, isLoading } = useReadContract({
		address: registryAddress,
		abi,
		functionName: 'getContributor',
		args: [vaultAddress, contributorAddress],
	})

	return {
		contributor: contributor as Contributor | undefined,
		isLoading,
	}
}

export function useTotalMonthlyAllocation(vaultAddress?: Address) {
	const { address: registryAddress, abi } = useContributorRegistry()
	
	const { data: totalAllocation, isLoading } = useReadContract({
		address: registryAddress,
		abi,
		functionName: 'getTotalMonthlyAllocation',
		args: vaultAddress ? [vaultAddress] : undefined,
		query: {
			enabled: !!vaultAddress,
		},
	})

	return {
		totalAllocation: totalAllocation as bigint | undefined,
		isLoading,
	}
}

