import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Script to create a new vault using VaultFactory
 * 
 * Usage:
 *   npx hardhat run scripts/create-vault.ts --network base-sepolia
 * 
 * Environment variables:
 *   ASSET_ADDRESS - Address of the asset token (e.g., USDC, DAI, WETH)
 *   VAULT_NAME - Name of the vault
 *   VAULT_DESCRIPTION - Description of the vault
 */

async function main() {
	const [deployer] = await ethers.getSigners()
	const network = await ethers.provider.getNetwork()

	console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)))
	console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())

	// Get configuration from environment or use defaults
	const vaultFactoryAddress = process.env.VAULT_FACTORY || '0xf149D831aBfbe9bC46218eF2086585FE00eA6655'
	const assetAddress = process.env.ASSET_ADDRESS || ethers.ZeroAddress
	const vaultName = process.env.VAULT_NAME || 'Test Vault'
	const vaultDescription = process.env.VAULT_DESCRIPTION || 'A test vault for OctantVault'

	if (assetAddress === ethers.ZeroAddress || !assetAddress) {
		throw new Error('ASSET_ADDRESS not set. Please set it in .env file or as environment variable.')
	}


	// Connect to VaultFactory
	const VaultFactory = await ethers.getContractFactory('VaultFactory')
	const vaultFactory = VaultFactory.attach(vaultFactoryAddress)

	// Create vault
	const tx = await vaultFactory.createVault(assetAddress, vaultName, vaultDescription)
	
	const receipt = await tx.wait()

	// Get vault address from event
	const event = receipt?.logs.find((log: any) => {
		try {
			const parsed = vaultFactory.interface.parseLog(log)
			return parsed?.name === 'VaultCreated'
		} catch {
			return false
		}
	})

	if (event) {
		const parsed = vaultFactory.interface.parseLog(event)
		const vaultAddress = parsed?.args[0] // First arg is vault address
		console.log(`   Use ContributorRegistry.addContributor(${vaultAddress}, ...)`)
	} else {
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

