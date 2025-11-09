'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS } from '@/lib/contracts'
import ContributorRegistryABI from '@/lib/abis/ContributorRegistry.json'
import VaultFactoryABI from '@/lib/abis/VaultFactory.json'
import SparkVaultFactoryABI from '@/lib/abis/SparkVaultFactory.json'
import QuadraticVotingABI from '@/lib/abis/QuadraticVoting.json'
import DistributionABI from '@/lib/abis/Distribution.json'
import VaultABI from '@/lib/abis/Vault.json'
import { Address } from 'viem'

export function useContributorRegistry() {
	const readContract = useReadContract()
	const writeContract = useWriteContract()
	const { isLoading: isPending, isSuccess } = useWaitForTransactionReceipt()

	return {
		readContract,
		writeContract,
		isPending,
		isSuccess,
		address: CONTRACTS.BASE_SEPOLIA.ContributorRegistry as Address,
		abi: ContributorRegistryABI.abi,
	}
}

export function useVaultFactory() {
	return {
		address: CONTRACTS.BASE_SEPOLIA.VaultFactory as Address,
		abi: VaultFactoryABI.abi,
	}
}

export function useSparkVaultFactory() {
	return {
		address: CONTRACTS.BASE_SEPOLIA.SparkVaultFactory as Address,
		abi: SparkVaultFactoryABI.abi,
	}
}

export function useQuadraticVoting() {
	return {
		address: CONTRACTS.BASE_SEPOLIA.QuadraticVoting as Address,
		abi: QuadraticVotingABI.abi,
	}
}

export function useDistribution() {
	return {
		address: CONTRACTS.BASE_SEPOLIA.Distribution as Address,
		abi: DistributionABI.abi,
	}
}

export function useVault(vaultAddress?: Address) {
	const readContract = useReadContract()
	const writeContract = useWriteContract()
	const { isLoading: isPending, isSuccess } = useWaitForTransactionReceipt()

	return {
		readContract,
		writeContract,
		isPending,
		isSuccess,
		address: vaultAddress,
		abi: VaultABI.abi,
	}
}

