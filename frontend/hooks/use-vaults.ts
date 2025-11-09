'use client'

import { useReadContract } from 'wagmi'
import { useVaultFactory, useSparkVaultFactory } from './use-contracts'
import { Address } from 'viem'
import { useMemo } from 'react'
import VaultABI from '@/lib/abis/Vault.json'
import SparkVaultABI from '@/lib/abis/SparkVault.json'
import { ASSETS } from '@/lib/assets'

export interface VaultInfo {
	address: Address
	name: string
	description: string
	totalAssets: bigint
	totalSupply: bigint
	asset: Address
}

export function useAllVaults() {
	const { address: factoryAddress, abi: factoryABI } = useVaultFactory()
	const { address: sparkFactoryAddress, abi: sparkFactoryABI } = useSparkVaultFactory()
	
	const { data: regularVaultCount, isLoading: isLoadingRegularCount } = useReadContract({
		address: factoryAddress,
		abi: factoryABI,
		functionName: 'getVaultCount',
		query: {
			refetchInterval: 5000,
		},
	})

	const { data: sparkVaultCount, isLoading: isLoadingSparkCount } = useReadContract({
		address: sparkFactoryAddress,
		abi: sparkFactoryABI,
		functionName: 'getVaultCount',
		query: {
			refetchInterval: 5000,
		},
	})

	const { data: regularVaults, isLoading: isLoadingRegularVaults } = useReadContract({
		address: factoryAddress,
		abi: factoryABI,
		functionName: 'getAllVaults',
		query: {
			enabled: !!regularVaultCount && Number(regularVaultCount) > 0,
			refetchInterval: 5000,
		},
	})

	const { data: sparkVaults, isLoading: isLoadingSparkVaults } = useReadContract({
		address: sparkFactoryAddress,
		abi: sparkFactoryABI,
		functionName: 'getAllVaults',
		query: {
			enabled: !!sparkVaultCount && Number(sparkVaultCount) > 0,
			refetchInterval: 5000,
		},
	})

	const OLD_VAULT_ADDRESSES = [
		'0x1F029A152BC240F38Adc3Be70EE62A01D7F9fEca',
	].map(addr => addr.toLowerCase())

	const allVaults = useMemo(() => {
		const regular = (regularVaults as Address[]) || []
		const spark = (sparkVaults as Address[]) || []
		const uniqueVaults = Array.from(new Set([...regular, ...spark]))
		const filteredVaults = uniqueVaults.filter(vault => {
			const vaultLower = vault.toLowerCase()
			return !OLD_VAULT_ADDRESSES.includes(vaultLower)
		})
		return filteredVaults
	}, [regularVaults, sparkVaults])

	const totalCount = useMemo(() => {
		const regular = regularVaultCount ? Number(regularVaultCount) : 0
		const spark = sparkVaultCount ? Number(sparkVaultCount) : 0
		return regular + spark
	}, [regularVaultCount, sparkVaultCount])

	return {
		vaults: allVaults.length > 0 ? allVaults : undefined,
		vaultCount: totalCount,
		isLoading: isLoadingRegularCount || isLoadingSparkCount || isLoadingRegularVaults || isLoadingSparkVaults,
	}
}

export function useVaultInfo(vaultAddress?: Address) {
	const { data: sparkVaultInfo, isLoading: isLoadingSpark, error: sparkError, refetch: refetchSpark } = useReadContract({
		address: vaultAddress,
		abi: SparkVaultABI.abi as any,
		functionName: 'getVaultInfo',
		query: {
			enabled: !!vaultAddress,
			refetchInterval: 5000,
		},
	})

	const { data: vaultInfo, isLoading: isLoadingVault, error: vaultError, refetch: refetchVault } = useReadContract({
		address: vaultAddress,
		abi: VaultABI.abi as any,
		functionName: 'getVaultInfo',
		query: {
			enabled: !!vaultAddress && !!sparkError,
			refetchInterval: 5000,
		},
	})

	const info = sparkVaultInfo || vaultInfo

	let parsedInfo: { name: string; description: string; totalAssetsValue: bigint; totalSupplyValue: bigint } | undefined = undefined
	
	if (info) {
		if (Array.isArray(info)) {
			parsedInfo = {
				name: String(info[0] || '').trim(),
				description: String(info[1] || '').trim(),
				totalAssetsValue: BigInt(info[2] || 0),
				totalSupplyValue: BigInt(info[3] || 0),
			}
		} else if (typeof info === 'object' && info !== null) {
			parsedInfo = {
				name: String((info as any).name || '').trim(),
				description: String((info as any).description || '').trim(),
				totalAssetsValue: BigInt((info as any).totalAssetsValue || (info as any).totalAssets || 0),
				totalSupplyValue: BigInt((info as any).totalSupplyValue || (info as any).totalSupply || 0),
			}
		}
	}

	return {
		vaultInfo: parsedInfo,
		isLoading: isLoadingVault || isLoadingSpark,
		error: sparkError || vaultError,
		refetch: sparkVaultInfo ? refetchSpark : refetchVault,
	}
}

