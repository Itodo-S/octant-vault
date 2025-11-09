/**
 * Contract addresses and configuration for Base Sepolia
 * All contracts deployed and ready for integration
 */

export const CONTRACTS = {
	BASE_SEPOLIA: {
		ContributorRegistry: '0x79dA447bF4A8f5603AeA849c16A96acF4af1f1ea',
		QuadraticVoting: '0x1D15e3471efA08d6CfC2BCb7E8b76C4185d000d0',
		Distribution: '0xF846B2Dc610b3A9B6b2d15F9BD217048E5E7F550',
		VaultFactory: '0xf149D831aBfbe9bC46218eF2086585FE00eA6655',
		SparkVaultFactory: '0x485900c8262F08057D165e5F5DdfaB306b8Fc96e',
	},
	CHAIN_ID: 84532,
	RPC_URL: 'https://sepolia.base.org',
	EXPLORER_URL: 'https://sepolia.basescan.org',
} as const

export const SUPPORTED_CHAINS = [
	{
		id: 84532,
		name: 'Base Sepolia',
		network: 'base-sepolia',
		nativeCurrency: {
			name: 'Ether',
			symbol: 'ETH',
			decimals: 18,
		},
		rpcUrls: {
			default: {
				http: ['https://sepolia.base.org'],
			},
		},
		blockExplorers: {
			default: {
				name: 'Basescan',
				url: 'https://sepolia.basescan.org',
			},
		},
		testnet: true,
	},
] as const

