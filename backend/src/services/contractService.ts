import { ethers } from 'ethers'
import { CONTRACTS } from '../config/contracts'

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org')

export class ContractService {
	private provider: ethers.JsonRpcProvider

	constructor() {
		this.provider = provider
	}

	async getVaultCount(): Promise<number> {
		const factory = new ethers.Contract(
			CONTRACTS.VAULT_FACTORY,
			['function getVaultCount() view returns (uint256)'],
			this.provider
		)
		const count = await factory.getVaultCount()
		return Number(count)
	}

	async getAllVaults(): Promise<string[]> {
		const regularFactory = new ethers.Contract(
			CONTRACTS.VAULT_FACTORY,
			['function getAllVaults() view returns (address[])'],
			this.provider
		)
		
		const sparkFactory = new ethers.Contract(
			CONTRACTS.SPARK_VAULT_FACTORY,
			['function getAllVaults() view returns (address[])'],
			this.provider
		)
		
		// Fetch vaults from both factories
		let regularVaults: string[] = []
		let sparkVaults: string[] = []
		
		try {
			regularVaults = await regularFactory.getAllVaults()
		} catch (error: any) {
			// Error fetching vaults from VaultFactory
		}
		
		try {
			sparkVaults = await sparkFactory.getAllVaults()
		} catch (error: any) {
			// Error fetching vaults from SparkVaultFactory
		}
		
		const allVaults = [...regularVaults, ...sparkVaults]
		const uniqueVaults = Array.from(new Set(allVaults))
		
		return uniqueVaults
	}

	async getVaultInfo(vaultAddress: string) {
		// Check if address is a contract
		const code = await this.provider.getCode(vaultAddress)
		if (code === '0x' || code === '0x0') {
			throw new Error(`No contract found at address ${vaultAddress}`)
		}

		// Try to call getVaultInfo - this works for Vault, SparkVault, and AaveVault
		const vault = new ethers.Contract(
			vaultAddress,
			[
				'function getVaultInfo() view returns (string memory name, string memory description, uint256 totalAssetsValue, uint256 totalSupplyValue)',
				'function asset() view returns (address)',
				'function owner() view returns (address)',
			],
			this.provider
		)
		
		try {
			const [name, description, totalAssets, totalSupply] = await vault.getVaultInfo()
			
			// Try to get asset and deployer (owner)
			let asset = ''
			let deployer = ''
			
			try {
				asset = await vault.asset()
			} catch (error) {
				// Asset might not be available, use empty string
			}
			
			try {
				deployer = await vault.owner()
			} catch (error) {
				// Owner might not be available, use empty string
			}
			
			return {
				name,
				description,
				totalAssets: totalAssets.toString(),
				totalSupply: totalSupply.toString(),
				asset: asset || ethers.ZeroAddress,
				deployer: deployer || ethers.ZeroAddress,
			}
		} catch (error: any) {
			// If getVaultInfo fails, the contract might not be a vault
			throw new Error(`Contract at ${vaultAddress} does not implement getVaultInfo() or is not a valid vault contract. Error: ${error.message}`)
		}
	}

	async getVaultContributors(vaultAddress: string): Promise<string[]> {
		const registry = new ethers.Contract(
			CONTRACTS.CONTRIBUTOR_REGISTRY,
			[
				'function getVaultContributors(address) view returns (address[] memory wallets, tuple(string name, string role, address wallet, uint256 monthlyAllocation, uint256 totalEarned, uint256 joinDate, bool isActive)[] memory contributorData)',
			],
			this.provider
		)
		const [wallets] = await registry.getVaultContributors(vaultAddress)
		return wallets
	}

	async getContributor(vaultAddress: string, contributorAddress: string) {
		const registry = new ethers.Contract(
			CONTRACTS.CONTRIBUTOR_REGISTRY,
			[
				'function getContributor(address, address) view returns (tuple(string name, string role, address wallet, uint256 monthlyAllocation, uint256 totalEarned, uint256 joinDate, bool isActive) memory contributor)',
			],
			this.provider
		)
		const contributor = await registry.getContributor(vaultAddress, contributorAddress)
		return {
			name: contributor.name,
			role: contributor.role,
			wallet: contributor.wallet,
			monthlyAllocation: contributor.monthlyAllocation.toString(),
			totalEarned: contributor.totalEarned.toString(),
			joinDate: contributor.joinDate.toString(),
			isActive: contributor.isActive,
		}
	}
}

export const contractService = new ContractService()

