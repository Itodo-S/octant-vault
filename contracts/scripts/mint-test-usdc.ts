import { ethers } from 'hardhat'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Mint Test USDC tokens to an address
 * Usage: npx hardhat run scripts/mint-test-usdc.ts --network base-sepolia <recipient> <amount>
 * Example: npx hardhat run scripts/mint-test-usdc.ts --network base-sepolia 0x123... 10000
 */
async function main() {
	const [deployer] = await ethers.getSigners()

	// Get Test USDC address from environment or use default
	const TEST_USDC_ADDRESS = process.env.TEST_USDC_ADDRESS || process.env.USDC_ADDRESS || '0x0000000000000000000000000000000000000000'
	
	if (TEST_USDC_ADDRESS === '0x0000000000000000000000000000000000000000') {
		process.exit(1)
	}

	// Get recipient address and amount from command line args
	const recipientAddress = process.argv[2] || deployer.address
	const amount = process.argv[3] || '10000' // Default 10,000 USDC

	if (!ethers.isAddress(recipientAddress)) {
		process.exit(1)
	}


	// Connect to Test USDC contract
	const TestERC20 = await ethers.getContractFactory('TestERC20')
	const testUSDC = TestERC20.attach(TEST_USDC_ADDRESS)

	// Mint tokens (USDC has 6 decimals)
	const mintAmount = ethers.parseUnits(amount, 6)
	
	console.log('\nMinting', ethers.formatUnits(mintAmount, 6), 'USDC...')
	const tx = await testUSDC.mint(recipientAddress, mintAmount)
	await tx.wait()
	

	// Check balance
	const balance = await testUSDC.balanceOf(recipientAddress)
	console.log('Recipient balance:', ethers.formatUnits(balance, 6), 'USDC')
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

