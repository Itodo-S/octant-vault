import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'
import type { IPool } from '../typechain-types/contracts/SparkVault.sol/IPool'

dotenv.config()

async function main() {
	const [deployer] = await ethers.getSigners()
	const network = await ethers.provider.getNetwork()

	console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)))
	console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())

	// Get Spark configuration from environment
	const sparkPoolAddress = getSparkPoolAddress()
	const assetAddresses = getAssetAddresses()
	const aTokenAddresses = getATokenAddresses()

	if (!sparkPoolAddress || sparkPoolAddress === ethers.ZeroAddress) {
		throw new Error('SPARK_POOL address not set in .env file. Please set it before deploying.')
	}


	// Deploy SparkVaultFactory
	const SparkVaultFactory = await ethers.getContractFactory('SparkVaultFactory')
	const sparkVaultFactory = await SparkVaultFactory.deploy(deployer.address)
	await sparkVaultFactory.waitForDeployment()
	const sparkVaultFactoryAddress = await sparkVaultFactory.getAddress()

	// Register Spark configuration for each asset
	
	// Connect to Spark Pool to fetch aToken addresses if needed
	const sparkPool = await ethers.getContractAt('IPool', sparkPoolAddress)
	
	for (const [assetName, assetAddress] of Object.entries(assetAddresses)) {
		if (assetAddress === ethers.ZeroAddress || !assetAddress) {
			continue
		}

		let aTokenAddress = aTokenAddresses[assetName as keyof typeof aTokenAddresses]
		
		// If aToken address not provided, fetch it from Spark Pool
		if (!aTokenAddress || aTokenAddress === ethers.ZeroAddress) {
			try {
				const reserveData = await sparkPool.getReserveData(assetAddress)
				aTokenAddress = reserveData.aTokenAddress
				if (aTokenAddress === ethers.ZeroAddress) {
					continue
				}
			} catch (error: any) {
				continue
			}
		}

		try {
			console.log(`Registering ${assetName} (asset: ${assetAddress}, aToken: ${aTokenAddress})...`)
			const tx = await sparkVaultFactory.registerSparkConfig(assetAddress, sparkPoolAddress, aTokenAddress)
			await tx.wait()
		} catch (error: any) {
		}
	}

	// Deploy other contracts

	// Deploy ContributorRegistry
	const ContributorRegistry = await ethers.getContractFactory('ContributorRegistry')
	const contributorRegistry = await ContributorRegistry.deploy(deployer.address)
	await contributorRegistry.waitForDeployment()
	const contributorRegistryAddress = await contributorRegistry.getAddress()

	// Deploy QuadraticVoting
	const QuadraticVoting = await ethers.getContractFactory('QuadraticVoting')
	const quadraticVoting = await QuadraticVoting.deploy(deployer.address, ethers.ZeroAddress)
	await quadraticVoting.waitForDeployment()
	const quadraticVotingAddress = await quadraticVoting.getAddress()

	// Deploy Distribution
	const Distribution = await ethers.getContractFactory('Distribution')
	const distribution = await Distribution.deploy(deployer.address, contributorRegistryAddress, 1000)
	await distribution.waitForDeployment()
	const distributionAddress = await distribution.getAddress()

	// Deploy VaultFactory
	const VaultFactory = await ethers.getContractFactory('VaultFactory')
	const vaultFactory = await VaultFactory.deploy(deployer.address)
	await vaultFactory.waitForDeployment()
	const vaultFactoryAddress = await vaultFactory.getAddress()

	// Print deployment summary
	console.log('Network:', network.name, '(Chain ID:', network.chainId.toString() + ')')

	console.log('   sparkVaultFactory.createVault(asset, name, description)')
	console.log('   sparkVault.addDonationRecipient(recipient, percentageBps)')

	// Save addresses to file
	const deploymentInfo = {
		network: network.name,
		chainId: network.chainId.toString(),
		deployer: deployer.address,
		contracts: {
			SparkVaultFactory: sparkVaultFactoryAddress,
			ContributorRegistry: contributorRegistryAddress,
			QuadraticVoting: quadraticVotingAddress,
			Distribution: distributionAddress,
			VaultFactory: vaultFactoryAddress,
		},
		sparkConfig: {
			sparkPool: sparkPoolAddress,
			assets: assetAddresses,
			aTokens: aTokenAddresses,
		},
		timestamp: new Date().toISOString(),
	}

	console.log('\n=== Deployment Info (save this) ===')
	console.log(JSON.stringify(deploymentInfo, null, 2))
}

function getSparkPoolAddress(): string {
	const network = process.env.DEPLOYMENT_NETWORK || 'ethereum-mainnet'
	if (network === 'ethereum-mainnet') {
		return process.env.SPARK_POOL_ETHEREUM || ''
	} else if (network === 'gnosis-chain') {
		return process.env.SPARK_POOL_GNOSIS || ''
	}
	return ''
}

function getAssetAddresses(): Record<string, string> {
	const network = process.env.DEPLOYMENT_NETWORK || 'ethereum-mainnet'
	const suffix = network === 'ethereum-mainnet' ? '_ETHEREUM' : '_GNOSIS'

	return {
		DAI: process.env[`DAI${suffix}`] || '',
		USDC: process.env[`USDC${suffix}`] || '',
		WETH: process.env[`WETH${suffix}`] || '',
	}
}

function getATokenAddresses(): Record<string, string> {
	const network = process.env.DEPLOYMENT_NETWORK || 'ethereum-mainnet'
	const suffix = network === 'ethereum-mainnet' ? '_ETHEREUM' : '_GNOSIS'

	return {
		DAI: process.env[`SPARK_ATOKEN_DAI${suffix}`] || '',
		USDC: process.env[`SPARK_ATOKEN_USDC${suffix}`] || '',
		WETH: process.env[`SPARK_ATOKEN_WETH${suffix}`] || '',
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

