'use client'

import { useReadContract } from 'wagmi'
import { useVaultFactory, useContributorRegistry, useDistribution } from './use-contracts'
import { useAllVaults } from './use-vaults'
import { useMemo } from 'react'
import { formatEther, Address } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

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

	// Fetch contributors from API for all vaults
	const { data: allApiContributors } = useQuery({
		queryKey: ['all-contributors', vaults],
		queryFn: async () => {
			if (!vaults || vaults.length === 0) return []
			
			const promises = vaults.map((vaultAddress) => 
				apiClient.getVaultContributors(vaultAddress).catch(() => ({ success: false, data: [] }))
			)
			return Promise.all(promises)
		},
		enabled: !!vaults && vaults.length > 0,
		staleTime: 0,
		refetchInterval: 10000,
	})

	// Calculate contributor count from API data
	const contributorCount = useMemo(() => {
		if (!allApiContributors || allApiContributors.length === 0) {
			// If API data is not available, try to get from contract for first vault as fallback
			return 0
		}
		
		const uniqueContributors = new Set<string>()
		
		allApiContributors.forEach((response: any) => {
			if (response?.success && Array.isArray(response.data)) {
				response.data.forEach((contributor: any) => {
					if (contributor.wallet && contributor.isActive !== false) {
						uniqueContributors.add(contributor.wallet.toLowerCase())
					}
				})
			}
		})
		
		return uniqueContributors.size
	}, [allApiContributors])

	// Get total contributors count
	const { data: allScheduleIds } = useReadContract({
		address: distributionAddress,
		abi: distributionABI,
		functionName: 'getAllScheduleIds',
	})

	return {
		totalAssets: formatEther(totalAssets),
		vaultCount,
		contributorCount,
		avgAPY: '0', // Would need to calculate from yield
		isLoading: isLoadingVaults,
	}
}