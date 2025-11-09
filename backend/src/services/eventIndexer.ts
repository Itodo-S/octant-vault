import { ethers } from 'ethers'
import { CONTRACTS } from '../config/contracts'
import { Vault } from '../models/Vault'
import { Contributor } from '../models/Contributor'
import { Voting } from '../models/Voting'
import { Distribution } from '../models/Distribution'

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org')

export class EventIndexer {
	private provider: ethers.JsonRpcProvider
	private isRunning: boolean = false

	constructor() {
		this.provider = provider
	}

	async start() {
		if (this.isRunning) {
			return
		}

		this.isRunning = true

		this.indexVaultCreatedEvents()
		this.indexContributorAddedEvents()
		this.indexVotingCreatedEvents()
		this.indexDistributionScheduledEvents()
	}

	private async indexVaultCreatedEvents() {
		const factory = new ethers.Contract(
			CONTRACTS.VAULT_FACTORY,
			['event VaultCreated(address indexed vault, address indexed deployer, address indexed asset, string name)'],
			this.provider
		)

		// Get events from last 1000 blocks
		const currentBlock = await this.provider.getBlockNumber()
		const fromBlock = Math.max(0, currentBlock - 1000)

		try {
			const events = await factory.queryFilter(factory.filters.VaultCreated(), fromBlock, currentBlock)
			
			for (const event of events) {
				if (event.args) {
					const vaultAddress = event.args.vault
					const existing = await Vault.findOne({ address: vaultAddress })
					if (!existing) {
						// Fetch vault info
						const vault = new ethers.Contract(
							vaultAddress,
							['function getVaultInfo() view returns (string, string, uint256, uint256)'],
							this.provider
						)
						const [name, description, totalAssets, totalSupply] = await vault.getVaultInfo()
						
						await Vault.create({
							address: vaultAddress,
							name,
							description,
							asset: event.args.asset,
							deployer: event.args.deployer,
							totalAssets: totalAssets.toString(),
							totalSupply: totalSupply.toString(),
						})
					}
				}
			}
		} catch (error) {
			// Error indexing vault events
		}
	}

	private async indexContributorAddedEvents() {
		const registry = new ethers.Contract(
			CONTRACTS.CONTRIBUTOR_REGISTRY,
			['event ContributorAdded(address indexed vault, address indexed wallet, string name, string role, uint256 monthlyAllocation)'],
			this.provider
		)

		const currentBlock = await this.provider.getBlockNumber()
		const fromBlock = Math.max(0, currentBlock - 1000)

		try {
			const events = await registry.queryFilter(registry.filters.ContributorAdded(), fromBlock, currentBlock)
			
			for (const event of events) {
				if (event.args) {
					const existing = await Contributor.findOne({
						vault: event.args.vault,
						wallet: event.args.wallet,
					})
					if (!existing) {
						await Contributor.create({
							vault: event.args.vault,
							wallet: event.args.wallet,
							name: event.args.name,
							role: event.args.role,
							monthlyAllocation: event.args.monthlyAllocation.toString(),
							totalEarned: '0',
							isActive: true,
						})
					}
				}
			}
		} catch (error) {
			// Error indexing contributor events
		}
	}

	private async indexVotingCreatedEvents() {
		const quadraticVoting = new ethers.Contract(
			CONTRACTS.QUADRATIC_VOTING,
			['event VotingCreated(uint256 indexed votingId, address indexed vault, address indexed nominee, string nomineeName, string description, uint256 startTime, uint256 endTime)'],
			this.provider
		)

		const currentBlock = await this.provider.getBlockNumber()
		const fromBlock = Math.max(0, currentBlock - 1000)

		try {
			const events = await quadraticVoting.queryFilter(quadraticVoting.filters.VotingCreated(), fromBlock, currentBlock)
			
			for (const event of events) {
				if (event.args) {
					const existing = await Voting.findOne({ votingId: Number(event.args.votingId) })
					if (!existing) {
						await Voting.create({
							votingId: Number(event.args.votingId),
							vault: event.args.vault,
							nominee: event.args.nominee,
							nomineeName: event.args.nomineeName,
							description: event.args.description,
							startTime: new Date(Number(event.args.startTime) * 1000),
							endTime: new Date(Number(event.args.endTime) * 1000),
							votesFor: 0,
							votesAgainst: 0,
							totalVotes: 0,
							isActive: true,
							isApproved: null,
						})
					}
				}
			}
		} catch (error) {
			// Error indexing voting events
		}
	}

	private async indexDistributionScheduledEvents() {
		const distribution = new ethers.Contract(
			CONTRACTS.DISTRIBUTION,
			['event DistributionScheduled(uint256 indexed scheduleId, address indexed vault, uint256 scheduledTime, uint8 distributionMethod)'],
			this.provider
		)

		const currentBlock = await this.provider.getBlockNumber()
		const fromBlock = Math.max(0, currentBlock - 1000)

		try {
			const events = await distribution.queryFilter(distribution.filters.DistributionScheduled(), fromBlock, currentBlock)
			
			for (const event of events) {
				if (event.args) {
					const existing = await Distribution.findOne({ scheduleId: Number(event.args.scheduleId) })
					if (!existing) {
						await Distribution.create({
							scheduleId: Number(event.args.scheduleId),
							vault: event.args.vault,
							scheduledTime: new Date(Number(event.args.scheduledTime) * 1000),
							distributionMethod: Number(event.args.distributionMethod),
							executed: false,
							executedAt: null,
							totalAmount: '0',
							recipientCount: 0,
						})
					}
				}
			}
		} catch (error) {
			// Error indexing distribution events
		}
	}

	async stop() {
		this.isRunning = false
	}
}

export const eventIndexer = new EventIndexer()

