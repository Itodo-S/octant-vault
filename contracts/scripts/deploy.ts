import { ethers } from 'hardhat'
import type { HardhatRuntimeEnvironment } from 'hardhat/types'

async function main() {
	const [deployer] = await ethers.getSigners()

	console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString())

	// Deploy ContributorRegistry
	const ContributorRegistry = await ethers.getContractFactory('ContributorRegistry')
	const contributorRegistry = await ContributorRegistry.deploy(deployer.address)
	await contributorRegistry.waitForDeployment()
	const contributorRegistryAddress = await contributorRegistry.getAddress()

	// Deploy QuadraticVoting
	const QuadraticVoting = await ethers.getContractFactory('QuadraticVoting')
	const quadraticVoting = await QuadraticVoting.deploy(deployer.address, ethers.ZeroAddress) // Using native token
	await quadraticVoting.waitForDeployment()
	const quadraticVotingAddress = await quadraticVoting.getAddress()

	// Deploy Distribution
	const Distribution = await ethers.getContractFactory('Distribution')
	const distribution = await Distribution.deploy(deployer.address, contributorRegistryAddress, 1000) // 10% reserved
	await distribution.waitForDeployment()
	const distributionAddress = await distribution.getAddress()

	// Deploy VaultFactory
	const VaultFactory = await ethers.getContractFactory('VaultFactory')
	const vaultFactory = await VaultFactory.deploy(deployer.address)
	await vaultFactory.waitForDeployment()
	const vaultFactoryAddress = await vaultFactory.getAddress()

	// Deploy SparkVaultFactory
	const SparkVaultFactory = await ethers.getContractFactory('SparkVaultFactory')
	const sparkVaultFactory = await SparkVaultFactory.deploy(deployer.address)
	await sparkVaultFactory.waitForDeployment()
	const sparkVaultFactoryAddress = await sparkVaultFactory.getAddress()

	console.log('   sparkVaultFactory.registerSparkConfig(asset, sparkPool, sparkAToken)')
	console.log('   sparkVaultFactory.createVault(asset, name, description)')
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

