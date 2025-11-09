'use client'

import { useReadContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { Address, formatEther, formatUnits } from 'viem'
import { getAssetDecimals } from '@/lib/assets'
import VaultABI from '@/lib/abis/Vault.json'
import SparkVaultABI from '@/lib/abis/SparkVault.json'

/**
 * Hook to get user's vault share balance
 */
export function useVaultShareBalance(vaultAddress?: Address) {
	const { address } = useAccount()

	// Try SparkVault first (ERC20 balanceOf)
	const { data: sparkBalance, isLoading: isLoadingSpark } = useReadContract({
		address: vaultAddress,
		abi: SparkVaultABI.abi as any,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: {
			enabled: !!vaultAddress && !!address,
		},
	})

	// Try regular Vault (ERC20 balanceOf)
	const { data: regularBalance, isLoading: isLoadingRegular } = useReadContract({
		address: vaultAddress,
		abi: VaultABI.abi as any,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: {
			enabled: !!vaultAddress && !!address && !sparkBalance,
		},
	})

	const balance = (sparkBalance || regularBalance) as bigint | undefined
	const isLoading = isLoadingSpark || isLoadingRegular

	return {
		balance: balance || 0n,
		balanceFormatted: balance ? formatEther(balance) : '0',
		isLoading,
		hasBalance: balance ? balance > 0n : false,
	}
}

/**
 * Hook to get user's asset (ERC20) balance
 */
export function useAssetBalance(assetAddress?: Address, assetName?: string) {
	const { address } = useAccount()

	const { data: balance, isLoading: isLoadingBalance } = useReadContract({
		address: assetAddress,
		abi: [
			{
				constant: true,
				inputs: [{ name: 'account', type: 'address' }],
				name: 'balanceOf',
				outputs: [{ name: '', type: 'uint256' }],
				type: 'function',
			},
		],
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
		query: {
			enabled: !!assetAddress && !!address && assetName !== 'ETH',
		},
	})

	const { data: contractDecimals, isLoading: isLoadingDecimals } = useReadContract({
		address: assetAddress,
		abi: [
			{
				constant: true,
				inputs: [],
				name: 'decimals',
				outputs: [{ name: '', type: 'uint8' }],
				type: 'function',
			},
		],
		functionName: 'decimals',
		query: {
			enabled: !!assetAddress && assetName !== 'ETH',
		},
	})

	const configDecimals = assetName ? getAssetDecimals(assetName) : 18
	const decimals = contractDecimals 
		? Number(contractDecimals) 
		: configDecimals
	
	const balanceBigInt = (balance as bigint) || 0n
	const balanceFormatted = formatUnits(balanceBigInt, decimals)
	const isLoading = isLoadingBalance || isLoadingDecimals

	return {
		balance: balanceBigInt,
		balanceFormatted,
		isLoading,
		hasBalance: balanceBigInt > 0n,
	}
}

/**
 * Hook to get user's ETH balance
 */
export function useETHBalance() {
	const { address } = useAccount()
	const { data: balance, isLoading } = useReadContract({
		address: undefined,
		abi: [],
		functionName: 'balanceOf',
		query: {
			enabled: false, // We'll use wagmi's useBalance instead
		},
	})

	return {
		balance: 0n,
		balanceFormatted: '0',
		isLoading: false,
		hasBalance: false,
	}
}

