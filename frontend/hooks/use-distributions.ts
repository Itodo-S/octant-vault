'use client'

import { useReadContract } from 'wagmi'
import { useDistribution } from './use-contracts'
import { Address } from 'viem'

export interface DistributionInfo {
	scheduleId: bigint
	vault: Address
	scheduledTime: bigint
	distributionMethod: number
	executed: boolean
}

export function useAllDistributions() {
	const { address: distributionAddress, abi } = useDistribution()
	
	const { data: scheduleIds, isLoading } = useReadContract({
		address: distributionAddress,
		abi,
		functionName: 'getAllScheduleIds',
		query: {
			refetchInterval: 30000, // Refetch every 30 seconds to catch new distributions
		},
	})

	return {
		scheduleIds: scheduleIds as bigint[] | undefined,
		isLoading,
	}
}

export function useDistributionById(scheduleId?: bigint) {
	const { address: distributionAddress, abi } = useDistribution()
	
	const { data: distribution, isLoading, refetch } = useReadContract({
		address: distributionAddress,
		abi,
		functionName: 'getSchedule', // Use getSchedule instead of getDistribution
		args: scheduleId !== undefined ? [scheduleId] : undefined,
		query: {
			enabled: scheduleId !== undefined,
			refetchInterval: 30000, // Refetch every 30 seconds (less aggressive)
		},
	})

	return {
		distribution: distribution as DistributionInfo | undefined,
		isLoading,
		refetch,
	}
}

