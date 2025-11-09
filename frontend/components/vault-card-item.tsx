'use client'

import { VaultCard } from './vault-card'
import { useVaultInfo } from '@/hooks/use-vaults'
import { useVaultContributors } from '@/hooks/use-contributors'
import { formatEther, formatUnits } from 'viem'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { getAssetDecimalsByAddress } from '@/lib/assets'
import VaultABI from '@/lib/abis/Vault.json'
import SparkVaultABI from '@/lib/abis/SparkVault.json'

interface VaultCardItemProps {
	vaultAddress: Address
}

export function VaultCardItem({ vaultAddress }: VaultCardItemProps) {
	const { vaultInfo, isLoading } = useVaultInfo(vaultAddress)
	const { contributors, isLoading: isLoadingContributors } = useVaultContributors(vaultAddress)

	// Get asset address from vault
	const { data: sparkAsset } = useReadContract({
		address: vaultAddress,
		abi: SparkVaultABI.abi as any,
		functionName: 'asset',
		query: {
			enabled: !!vaultAddress,
		},
	})

	const { data: regularAsset } = useReadContract({
		address: vaultAddress,
		abi: VaultABI.abi as any,
		functionName: 'asset',
		query: {
			enabled: !!vaultAddress && !sparkAsset,
		},
	})

	const assetAddress = (sparkAsset || regularAsset) as Address | undefined
	const assetDecimals = assetAddress ? getAssetDecimalsByAddress(assetAddress) : 18

	if (isLoading) {
		return (
			<div className="border rounded-lg p-6 animate-pulse">
				<div className="h-6 bg-muted rounded w-3/4 mb-2" />
				<div className="h-4 bg-muted rounded w-1/2 mb-4" />
				<div className="h-8 bg-muted rounded w-1/4" />
			</div>
		)
	}

	if (!vaultInfo) {
		return null
	}

	// Format total assets with correct decimals
	const totalAssetsFormatted = vaultInfo.totalAssetsValue && vaultInfo.totalAssetsValue > 0n
		? Number(formatUnits(vaultInfo.totalAssetsValue, assetDecimals)).toLocaleString(undefined, { maximumFractionDigits: 2 })
		: '0'

	const vault = {
		id: vaultAddress,
		name: vaultInfo.name || 'Unnamed Vault',
		description: vaultInfo.description || 'No description',
		totalAssets: `$${totalAssetsFormatted}`,
		yieldAPY: '0%', // Would need to calculate from yield
		monthlyYield: '$0', // Would need to calculate
		contributors: contributors?.length || 0,
		status: 'active' as const,
		deployer: vaultAddress.slice(0, 6) + '...' + vaultAddress.slice(-4),
	}

	return <VaultCard vault={vault} />
}

