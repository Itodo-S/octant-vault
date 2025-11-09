import { ethers } from 'hardhat'
import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Script to populate test data for the frontend
 * This creates sample vaults, contributors, votings, and distributions
 */
async function main() {
	const [deployer] = await ethers.getSigners()
	const network = await ethers.provider.getNetwork()

	console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)))
	console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())

	// Get contract addresses from environment or use defaults
	const CONTRACTS = {
		ContributorRegistry: process.env.CONTRIBUTOR_REGISTRY || '0x79dA447bF4A8f5603AeA849c16A96acF4af1f1ea',
		QuadraticVoting: process.env.QUADRATIC_VOTING || '0x1D15e3471efA08d6CfC2BCb7E8b76C4185d000d0',
		Distribution: process.env.DISTRIBUTION || '0xF846B2Dc610b3A9B6b2d15F9BD217048E5E7F550',
		VaultFactory: process.env.VAULT_FACTORY || '0xf149D831aBfbe9bC46218eF2086585FE00eA6655',
		SparkVaultFactory: process.env.SPARK_VAULT_FACTORY || '0x485900c8262F08057D165e5F5DdfaB306b8Fc96e',
	}

	// Test asset addresses (Base Sepolia)
	const ASSETS = {
		USDC: process.env.USDC_ADDRESS || '0x437A82737FF31437D9F0dD20068546c9e094b4db', // Test USDC (6 decimals)
		DAI: process.env.DAI_ADDRESS || '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
		WETH: process.env.WETH_ADDRESS || '0x4200000000000000000000000000000000000006',
	}

	// Test contributor addresses (you can use your own or generate new ones)
	const TEST_CONTRIBUTORS = [
		{
			name: 'Alex Chen',
			role: 'Lead Developer',
			wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', // Example address
			monthlyAllocation: '2000', // 2000 tokens
		},
		{
			name: 'Maria Garcia',
			role: 'UI/UX Designer',
			wallet: '0x8ba1f109551bD432803012645Hac136c22C172e8', // Example address
			monthlyAllocation: '1500',
		},
		{
			name: 'James Wilson',
			role: 'Community Manager',
			wallet: '0x1234567890123456789012345678901234567890', // Example address
			monthlyAllocation: '1200',
		},
		{
			name: 'Sofia Rossi',
			role: 'Smart Contract Auditor',
			wallet: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', // Example address
			monthlyAllocation: '1800',
		},
	]


	// Get contract instances
	const VaultFactory = await ethers.getContractFactory('VaultFactory')
	const vaultFactory = VaultFactory.attach(CONTRACTS.VaultFactory)

	const SparkVaultFactory = await ethers.getContractFactory('SparkVaultFactory')
	const sparkVaultFactory = SparkVaultFactory.attach(CONTRACTS.SparkVaultFactory)

	const vaultAddresses: string[] = []

	// Create regular vaults
	const regularVaults = [
		{ name: 'OpenSea Creator Fund', description: 'Supporting independent creators and artists', asset: ASSETS.USDC },
		{ name: 'Climate DAO', description: 'Funding climate action initiatives', asset: ASSETS.DAI },
		{ name: 'Dev Commons', description: 'Open source development grants', asset: ASSETS.USDC },
	]

	for (const vault of regularVaults) {
		try {
			const tx = await vaultFactory.createVault(vault.asset, vault.name, vault.description)
			const receipt = await tx.wait()
			
			// Extract vault address from event
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
				const vaultAddress = parsed?.args[1] // vault address is typically the second arg
				vaultAddresses.push(vaultAddress)
			} else {
			}
		} catch (error: any) {
		}
	}

	// Create Spark vault (if Spark is configured)
	try {
		// Check if Spark config exists for USDC
		const sparkConfig = await sparkVaultFactory.sparkConfigs(ASSETS.USDC)
		if (sparkConfig.sparkPool !== ethers.ZeroAddress) {
			const tx = await sparkVaultFactory.createVault(ASSETS.USDC, 'Public Health Fund', 'Supporting public health initiatives with Spark yield')
			const receipt = await tx.wait()
			
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
				const vaultAddress = parsed?.args[1]
				vaultAddresses.push(vaultAddress)
			}
		} else {
		}
	} catch (error: any) {
	}

	if (vaultAddresses.length === 0) {
		return
	}

	console.log(`\n✓ Created ${vaultAddresses.length} vault(s)`)


	const ContributorRegistry = await ethers.getContractFactory('ContributorRegistry')
	const contributorRegistry = ContributorRegistry.attach(CONTRACTS.ContributorRegistry)

	// Add contributors to the first vault
	const firstVault = vaultAddresses[0]

	for (const contributor of TEST_CONTRIBUTORS) {
		try {
			// Convert monthly allocation to wei (18 decimals)
			const allocation = ethers.parseEther(contributor.monthlyAllocation)
			
			console.log(`Adding ${contributor.name} (${contributor.role})...`)
			const tx = await contributorRegistry.addContributor(
				firstVault,
				contributor.wallet,
				contributor.name,
				contributor.role,
				allocation
			)
			await tx.wait()
		} catch (error: any) {
		}
	}


	const QuadraticVoting = await ethers.getContractFactory('QuadraticVoting')
	const quadraticVoting = QuadraticVoting.attach(CONTRACTS.QuadraticVoting)

	// Create some test votings
	const testVotings = [
		{
			nominee: TEST_CONTRIBUTORS[0].wallet,
			nomineeName: TEST_CONTRIBUTORS[0].name,
			role: 'Senior Developer',
			description: 'Promote to Senior Developer with increased allocation',
			duration: 7 * 24 * 60 * 60, // 7 days
		},
		{
			nominee: TEST_CONTRIBUTORS[1].wallet,
			nomineeName: TEST_CONTRIBUTORS[1].name,
			role: 'Lead Designer',
			description: 'Promote to Lead Designer role',
			duration: 5 * 24 * 60 * 60, // 5 days
		},
	]

	for (const voting of testVotings) {
		try {
			const tx = await quadraticVoting.createVoting(
				firstVault,
				voting.nominee,
				voting.nomineeName,
				voting.role,
				voting.description,
				BigInt(voting.duration)
			)
			await tx.wait()
		} catch (error: any) {
		}
	}


	const Distribution = await ethers.getContractFactory('Distribution')
	const distribution = Distribution.attach(CONTRACTS.Distribution)

	// Schedule distributions for the next few days
	const now = Math.floor(Date.now() / 1000)
	const distributions = [
		{
			scheduledTime: now + 24 * 60 * 60, // Tomorrow
			method: 0, // Proportional
		},
		{
			scheduledTime: now + 7 * 24 * 60 * 60, // Next week
			method: 1, // Equal
		},
	]

	for (const dist of distributions) {
		try {
			console.log(`Scheduling distribution for ${new Date(dist.scheduledTime * 1000).toLocaleString()}...`)
			const tx = await distribution.scheduleDistribution(
				firstVault,
				BigInt(dist.scheduledTime),
				dist.method
			)
			await tx.wait()
		} catch (error: any) {
		}
	}

	vaultAddresses.forEach((addr, idx) => {
	})

}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

