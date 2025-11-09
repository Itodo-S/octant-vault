/**
 * Asset addresses for Base Sepolia
 * These are common testnet token addresses
 */

export const ASSETS = {
	USDC: '0x437A82737FF31437D9F0dD20068546c9e094b4db', // Test USDC (Base Sepolia) - 6 decimals
	USDC_OLD: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Old USDC address (for existing vaults)
	USDT: '0x4200000000000000000000000000000000000006', // Base Sepolia USDT (example)
	DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // Base Sepolia DAI (example)
	WETH: '0x4200000000000000000000000000000000000006', // Base Sepolia WETH (example)
	ETH: '0x0000000000000000000000000000000000000000', // Native ETH
} as const

// Map old USDC address to USDC for backwards compatibility
const ASSET_ADDRESS_MAP: Record<string, string> = {
	'0x036cbd53842c5426634e7929541ec2318f3dcf7e': 'USDC', // Old USDC -> USDC
	'0x437a82737ff31437d9f0dd20068546c9e094b4db': 'USDC', // New USDC -> USDC
}

export const ASSET_DECIMALS = {
	USDC: 6,
	USDT: 6,
	DAI: 18,
	WETH: 18,
	ETH: 18,
} as const

export function getAssetAddress(assetName: string): string {
	return ASSETS[assetName as keyof typeof ASSETS] || ASSETS.USDC
}

export function getAssetDecimals(assetName: string): number {
	return ASSET_DECIMALS[assetName as keyof typeof ASSET_DECIMALS] || 18
}

export function getAssetName(assetAddress: string): string {
	if (!assetAddress) return 'Unknown'
	
	const normalizedAddress = assetAddress.toLowerCase()
	
	// Check address map first (for backwards compatibility)
	if (ASSET_ADDRESS_MAP[normalizedAddress]) {
		return ASSET_ADDRESS_MAP[normalizedAddress]
	}
	
	// Find the asset name by matching the address
	for (const [name, address] of Object.entries(ASSETS)) {
		if (address.toLowerCase() === normalizedAddress) {
			// Map USDC_OLD to USDC
			return name === 'USDC_OLD' ? 'USDC' : name
		}
	}
	
	// If not found, return a shortened address
	return `${assetAddress.slice(0, 6)}...${assetAddress.slice(-4)}`
}

/**
 * Get asset decimals for an address (supports both old and new USDC)
 */
export function getAssetDecimalsByAddress(assetAddress: string): number {
	const assetName = getAssetName(assetAddress)
	return getAssetDecimals(assetName)
}

