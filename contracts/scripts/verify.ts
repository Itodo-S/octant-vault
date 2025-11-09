import { run } from 'hardhat'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
	// Get network from command line or environment
	const networkArg = process.argv.find(arg => arg.startsWith('--network'))
	const network = networkArg ? networkArg.split('=')[1] || process.argv[process.argv.indexOf(networkArg) + 1] : process.env.DEPLOYMENT_NETWORK || 'ethereum-mainnet'
	
	// Get contract address (first non-flag argument after --network)
	const args = process.argv.slice(2)
	const networkIndex = args.findIndex(arg => arg === '--network')
	const contractAddress = networkIndex >= 0 ? args[networkIndex + 2] : args[0]

	if (!contractAddress) {
		process.exit(1)
	}

	// Get constructor arguments (everything after contract address)
	const constructorArgs = networkIndex >= 0 ? args.slice(networkIndex + 3) : args.slice(1)

	if (constructorArgs.length > 0) {
	}

	try {
		await run('verify:verify', {
			address: contractAddress,
			network: network,
			constructorArguments: constructorArgs,
		})
	} catch (error: any) {
		if (error.message.includes('Already Verified') || error.message.includes('already verified')) {
		} else {
			process.exit(1)
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		process.exit(1)
	})

