import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Simplified script to populate test data
 * Creates one vault and adds a few contributors
 */
async function main() {
	const [deployer] = await ethers.getSigners()

	console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)))

	// Contract addresses (Base Sepolia)
	const CONTRACTS = {
		VaultFactory: '0xf149D831aBfbe9bC46218eF2086585FE00eA6655',
		ContributorRegistry: '0x79dA447bF4A8f5603AeA849c16A96acF4af1f1ea',
		QuadraticVoting: '0x1D15e3471efA08d6CfC2BCb7E8b76C4185d000d0',
		Distribution: '0xF846B2Dc610b3A9B6b2d15F9BD217048E5E7F550',
	}

	// Use deployer address as test asset (for testing purposes)
	// In production, use real asset addresses
	const testAsset = deployer.address


	const VaultFactory = await ethers.getContractFactory('VaultFactory')
	const vaultFactory = VaultFactory.attach(CONTRACTS.VaultFactory)

	try {
		const tx = await vaultFactory.createVault(
			testAsset,
			'Test Vault',
			'A test vault for development and testing'
		)
		const receipt = await tx.wait()
		
		// Find VaultCreated event
		const vaultCreatedEvent = receipt?.logs.find((log: any) => {
			try {
				const parsed = vaultFactory.interface.parseLog(log)
				return parsed?.name === 'VaultCreated'
			} catch {
				return false
			}
		})

		if (!vaultCreatedEvent) {
			return
		}

		const parsed = vaultFactory.interface.parseLog(vaultCreatedEvent)
		const vaultAddress = parsed?.args[1] // vault address
		


		const ContributorRegistry = await ethers.getContractFactory('ContributorRegistry')
		const contributorRegistry = ContributorRegistry.attach(CONTRACTS.ContributorRegistry)

		// Add deployer as a contributor
		const contributors = [
			{
				wallet: deployer.address,
				name: 'Test Contributor',
				role: 'Developer',
				allocation: ethers.parseEther('1000'), // 1000 tokens
			},
		]

		for (const contributor of contributors) {
			try {
				const tx = await contributorRegistry.addContributor(
					vaultAddress,
					contributor.wallet,
					contributor.name,
					contributor.role,
					contributor.allocation
				)
				await tx.wait()
			} catch (error: any) {
			}
		}


	} catch (error: any) {
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

