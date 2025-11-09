import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.23',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		hardhat: {
			chainId: 1337,
		},
		'ethereum-mainnet': {
			url: process.env.ETHEREUM_MAINNET_RPC_URL || '',
			accounts: process.env.ETHEREUM_MAINNET_PRIVATE_KEY ? [process.env.ETHEREUM_MAINNET_PRIVATE_KEY] : [],
			chainId: 1,
		},
		'gnosis-chain': {
			url: process.env.GNOSIS_CHAIN_RPC_URL || 'https://rpc.gnosischain.com',
			accounts: process.env.GNOSIS_CHAIN_PRIVATE_KEY ? [process.env.GNOSIS_CHAIN_PRIVATE_KEY] : [],
			chainId: 100,
		},
		'base-sepolia': {
			url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
			accounts: process.env.BASE_SEPOLIA_PRIVATE_KEY ? [process.env.BASE_SEPOLIA_PRIVATE_KEY] : [],
			chainId: 84532,
		},
	},
	etherscan: {
		apiKey: {
			'ethereum-mainnet': process.env.ETHERSCAN_API_KEY || '',
			'gnosis-chain': process.env.GNOSISSCAN_API_KEY || '',
			'base-sepolia': process.env.BASESCAN_API_KEY || '',
		},
		customChains: [
			{
				network: 'gnosis-chain',
				chainId: 100,
				urls: {
					apiURL: 'https://api.gnosisscan.io/api',
					browserURL: 'https://gnosisscan.io',
				},
			},
			{
				network: 'base-sepolia',
				chainId: 84532,
				urls: {
					apiURL: 'https://api-sepolia.basescan.org/api',
					browserURL: 'https://sepolia.basescan.org',
				},
			},
		],
	},
	paths: {
		sources: './contracts',
		tests: './test',
		cache: './cache',
		artifacts: './artifacts',
	},
}

export default config

