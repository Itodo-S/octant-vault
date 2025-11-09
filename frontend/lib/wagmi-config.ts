import { createConfig, http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { CONTRACTS } from './contracts'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const wagmiConfig = createConfig({
	chains: [baseSepolia],
	connectors: [
		injected(),
		metaMask(),
	],
	transports: {
		[baseSepolia.id]: http(CONTRACTS.RPC_URL),
	},
	ssr: typeof window === 'undefined',
	// Ensure Base Sepolia is the default chain
	defaultChain: baseSepolia,
})

export const config = {
	chain: baseSepolia,
	contracts: CONTRACTS.BASE_SEPOLIA,
}

