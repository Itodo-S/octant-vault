'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Address } from 'viem'

export function useApiVaults() {
	return useQuery({
		queryKey: ['vaults'],
		queryFn: () => apiClient.getVaults(),
		staleTime: 30000, // 30 seconds
	})
}

export function useApiVault(address?: Address) {
	return useQuery({
		queryKey: ['vault', address],
		queryFn: () => apiClient.getVault(address!),
		enabled: !!address,
		staleTime: 30000,
	})
}

export function useApiContributors(vaultAddress?: Address) {
	return useQuery({
		queryKey: ['contributors', vaultAddress],
		queryFn: () => apiClient.getVaultContributors(vaultAddress!),
		enabled: !!vaultAddress,
		staleTime: 0, // Always refetch to get latest data
		refetchInterval: 5000, // Refetch every 5 seconds to catch new contributors
	})
}

export function useApiActiveVotings() {
	return useQuery({
		queryKey: ['votings', 'active'],
		queryFn: () => apiClient.getActiveVotings(),
		staleTime: 10000, // Consider data fresh for 10 seconds
		refetchInterval: 30000, // Refetch every 30 seconds (less aggressive)
		refetchOnWindowFocus: true, // Refetch when user returns to tab
	})
}

export function useApiPastVotings() {
	return useQuery({
		queryKey: ['votings', 'past'],
		queryFn: () => apiClient.getPastVotings(),
		staleTime: 30000, // Consider data fresh for 30 seconds
		refetchInterval: 60000, // Refetch every 60 seconds (less aggressive)
		refetchOnWindowFocus: true, // Refetch when user returns to tab
	})
}

export function useApiUpcomingDistributions() {
	return useQuery({
		queryKey: ['distributions', 'upcoming'],
		queryFn: () => apiClient.getUpcomingDistributions(),
		staleTime: 10000, // Consider data fresh for 10 seconds
		refetchInterval: 30000, // Refetch every 30 seconds (less aggressive)
		refetchOnWindowFocus: true, // Refetch when user returns to tab
	})
}

export function useApiRecentDistributions() {
	return useQuery({
		queryKey: ['distributions', 'recent'],
		queryFn: () => apiClient.getRecentDistributions(),
		staleTime: 30000, // Consider data fresh for 30 seconds
		refetchInterval: 60000, // Refetch every 60 seconds (less aggressive)
		refetchOnWindowFocus: true, // Refetch when user returns to tab
	})
}

