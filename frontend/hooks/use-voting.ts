'use client'

import { useReadContract } from 'wagmi'
import { useQuadraticVoting } from './use-contracts'
import { Address } from 'viem'

export interface VotingInfo {
	votingId: bigint
	vault: Address
	nominee: Address
	nomineeName: string
	description: string
	startTime: bigint
	endTime: bigint
	votesFor: bigint
	votesAgainst: bigint
	totalVotes: bigint
	isActive: boolean
}

export function useAllVotings() {
	const { address: votingAddress, abi } = useQuadraticVoting()
	
	const { data: votingCount, isLoading: isLoadingCount } = useReadContract({
		address: votingAddress,
		abi,
		functionName: 'getVotingCount',
		query: {
			refetchInterval: 30000, // Refetch every 30 seconds (less aggressive)
		},
	})

	const { data: allVotingIds, isLoading: isLoadingIds } = useReadContract({
		address: votingAddress,
		abi,
		functionName: 'getAllVotingIds',
		query: {
			enabled: !!votingCount && Number(votingCount) > 0,
			refetchInterval: 30000, // Refetch every 30 seconds (less aggressive)
		},
	})

	return {
		votingIds: allVotingIds as bigint[] | undefined,
		votingCount: votingCount ? Number(votingCount) : 0,
		isLoading: isLoadingCount || isLoadingIds,
	}
}

export function useVoting(votingId?: bigint) {
	const { address: votingAddress, abi } = useQuadraticVoting()
	
	const { data: voting, isLoading, refetch } = useReadContract({
		address: votingAddress,
		abi,
		functionName: 'getVoting',
		args: votingId !== undefined ? [votingId] : undefined,
		query: {
			enabled: votingId !== undefined,
			refetchInterval: 30000, // Refetch every 30 seconds (less aggressive)
		},
	})

	return {
		voting: voting as VotingInfo | undefined,
		isLoading,
		refetch,
	}
}

/**
 * Hook to fetch all voting data from contract using voting IDs
 */
export function useContractVotings(votingIds?: bigint[]) {
	const { address: votingAddress, abi } = useQuadraticVoting()
	
	// Fetch all voting data in parallel
	const votingQueries = votingIds?.map((votingId) => ({
		address: votingAddress,
		abi,
		functionName: 'getVoting' as const,
		args: [votingId] as const,
	})) || []

	// For now, we'll return empty array - in production, you'd use useReadContracts to batch fetch
	// This is a simplified version - you'd need to implement batching properly
	return {
		votings: [] as VotingInfo[],
		isLoading: false,
	}
}

