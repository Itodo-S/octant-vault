'use client'

import { useReadContract } from 'wagmi'
import { useVaultFactory, useContributorRegistry, useDistribution } from './use-contracts'
import { useAllVaults } from './use-vaults'
import { useMemo } from 'react'
import { formatEther } from 'viem'

export function useDashboardStats() {
	const { vaults, vaultCount, isLoading: isLoadingVaults } = useAllVaults()
	const { address: factoryAddress, abi: factoryABI } = useVaultFactory()
	const { address: registryAddress, abi: registryABI } = useContributorRegistry()
	const { address: distributionAddress, abi: distributionABI } = useDistribution()

	// Calculate total assets across all vaults
	const vaultAssetsQueries = vaults?.map((vaultAddress) => ({
		address: vaultAddress,
		abi: factoryABI,
		functionName: 'totalAssets' as const,
	})) || []

	// For now, we'll use a simplified approach
	// In production, you'd want to batch these queries
	const totalAssets = useMemo(() => {
		// This would need to be implemented with actual contract calls
		// For now, return 0 as placeholder
		return 0n
	}, [vaults])

	// Get total contributors count
	const { data: allScheduleIds } = useReadContract({
		address: distributionAddress,
		abi: distributionABI,
		functionName: 'getAllScheduleIds',
	})

	return {
		totalAssets: formatEther(totalAssets),
		vaultCount,
		contributorCount: 0, // Would need to aggregate from all vaults
		avgAPY: '0', // Would need to calculate from yield
		isLoading: isLoadingVaults,
	}
}

