import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Script to create a new Spark vault using SparkVaultFactory
 * 
 * Usage:
 *   npx hardhat run scripts/create-spark-vault.ts --network base-sepolia
 * 
 * Environment variables:
 *   ASSET_ADDRESS - Address of the asset token (e.g., DAI, USDC, WETH)
 *   VAULT_NAME - Name of the vault
 *   VAULT_DESCRIPTION - Description of the vault
 * 
 * Note: Spark configuration must be registered for the asset first
 */

async function main() {
	const [deployer] = await ethers.getSigners()
	const network = await ethers.provider.getNetwork()

	console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)))
	console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())

	// Get configuration from environment or use defaults
	const sparkVaultFactoryAddress = process.env.SPARK_VAULT_FACTORY || '0x485900c8262F08057D165e5F5DdfaB306b8Fc96e'
	const assetAddress = process.env.ASSET_ADDRESS || ethers.ZeroAddress
	const vaultName = process.env.VAULT_NAME || 'Spark Test Vault'
	const vaultDescription = process.env.VAULT_DESCRIPTION || 'A test Spark vault for OctantVault'

	if (assetAddress === ethers.ZeroAddress || !assetAddress) {
		throw new Error('ASSET_ADDRESS not set. Please set it in .env file or as environment variable.')
	}


	// Connect to SparkVaultFactory
	const SparkVaultFactory = await ethers.getContractFactory('SparkVaultFactory')
	const sparkVaultFactory = SparkVaultFactory.attach(sparkVaultFactoryAddress)

	// Check if Spark config is registered
	const config = await sparkVaultFactory.sparkConfigs(assetAddress)
	if (!config.isConfigured) {
		throw new Error(`Spark configuration not registered for asset ${assetAddress}. Please register it first using SparkVaultFactory.registerSparkConfig()`)
	}

	// Create vault
	const tx = await sparkVaultFactory.createVault(assetAddress, vaultName, vaultDescription)
	
	const receipt = await tx.wait()

	// Get vault address from event
	const event = receipt?.logs.find((log: any) => {
		try {
			const parsed = sparkVaultFactory.interface.parseLog(log)
			return parsed?.name === 'VaultCreated'
		} catch {
			return false
		}
	})

	if (event) {
		const parsed = sparkVaultFactory.interface.parseLog(event)
		const vaultAddress = parsed?.args[0] // First arg is vault address
		console.log(`   Use ContributorRegistry.addContributor(${vaultAddress}, ...)`)
		console.log(`   Use SparkVault.addDonationRecipient(...)`)
	} else {
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

