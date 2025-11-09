import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Script to register Spark configuration for an asset
 * 
 * Usage:
 *   npx hardhat run scripts/register-spark-config.ts --network base-sepolia
 * 
 * Environment variables:
 *   SPARK_VAULT_FACTORY - Address of SparkVaultFactory (default: 0x485900c8262F08057D165e5F5DdfaB306b8Fc96e)
 *   ASSET_ADDRESS - Address of the asset token (e.g., USDC)
 *   SPARK_POOL_ADDRESS - Address of Spark Pool (or use placeholder for testing)
 *   SPARK_ATOKEN_ADDRESS - Address of Spark aToken (or use placeholder for testing)
 * 
 * Note: For Base Sepolia testing, you can use placeholder addresses if Spark is not deployed.
 *       In production, use real Spark Pool and aToken addresses.
 */

async function main() {
	const [deployer] = await ethers.getSigners()
	const network = await ethers.provider.getNetwork()

	console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)))
	console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())

	// Get configuration from environment or use defaults
	const sparkVaultFactoryAddress = process.env.SPARK_VAULT_FACTORY || '0x485900c8262F08057D165e5F5DdfaB306b8Fc96e'
	const assetAddress = process.env.ASSET_ADDRESS || process.env.USDC_ADDRESS || '0x437A82737FF31437D9F0dD20068546c9e094b4db'
	
	// For Base Sepolia, if Spark is not deployed, use placeholder addresses
	// In production, these should be real Spark Pool and aToken addresses
	const sparkPoolAddress = process.env.SPARK_POOL_ADDRESS || process.env.SPARK_POOL_BASE_SEPOLIA || '0x682046756e640000000000000000000000000000'
	const sparkATokenAddress = process.env.SPARK_ATOKEN_ADDRESS || process.env.SPARK_ATOKEN_USDC || '0x682046756e640000000000000000000000000000'


	// Connect to SparkVaultFactory
	const SparkVaultFactory = await ethers.getContractFactory('SparkVaultFactory')
	const sparkVaultFactory = SparkVaultFactory.attach(sparkVaultFactoryAddress)

	// Check if already registered
	const existingConfig = await sparkVaultFactory.sparkConfigs(assetAddress)
	if (existingConfig.isConfigured) {
		console.log('\nTo update, you would need to call registerSparkConfig again (this will overwrite)')
	}

	// Register Spark config
	try {
		const tx = await sparkVaultFactory.registerSparkConfig(
			assetAddress,
			sparkPoolAddress,
			sparkATokenAddress
		)
		
		const receipt = await tx.wait()

		// Verify registration
		const config = await sparkVaultFactory.sparkConfigs(assetAddress)

	} catch (error: any) {
		if (error.message.includes('onlyOwner')) {
		} else {
		}
		throw error
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

