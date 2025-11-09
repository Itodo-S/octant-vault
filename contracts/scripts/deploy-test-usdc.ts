import { ethers } from 'hardhat'
import type { HardhatRuntimeEnvironment } from 'hardhat/types'

/**
 * Deploy Test USDC token for Base Sepolia testing
 * This deploys an ERC20 token configured as USDC (6 decimals, proper name/symbol)
 * Usage: npx hardhat run scripts/deploy-test-usdc.ts --network base-sepolia
 */
async function main() {
	const [deployer] = await ethers.getSigners()

	console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)))

	const network = await ethers.provider.getNetwork()
	console.log('Network:', network.name, 'Chain ID:', network.chainId.toString())

	// Deploy ERC20 as USDC with 6 decimals (USDC standard)
	const TestERC20 = await ethers.getContractFactory('TestERC20')
	const testUSDC = await TestERC20.deploy('USD Coin', 'USDC', 6) // 6 decimals for USDC
	await testUSDC.waitForDeployment()
	const testUSDCAddress = await testUSDC.getAddress()

	// Mint initial supply to deployer for testing
	// USDC uses 6 decimals
	const initialSupply = ethers.parseUnits('1000000', 6) // 1M USDC
	console.log('\nMinting', ethers.formatUnits(initialSupply, 6), 'USDC to deployer...')
	await testUSDC.mint(deployer.address, initialSupply)

	// Verify token details
	const name = await testUSDC.name()
	const symbol = await testUSDC.symbol()
	const balance = await testUSDC.balanceOf(deployer.address)
	
	console.log('Decimals: 6 (USDC standard)')
	console.log('Deployer balance:', ethers.formatUnits(balance, 6), 'USDC')

}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

