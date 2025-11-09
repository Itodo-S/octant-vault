import { Request, Response } from 'express'
import { Voting } from '../models/Voting'
import { contractService } from '../services/contractService'
import { ethers } from 'ethers'
import { CONTRACTS } from '../config/contracts'

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org')

export class VotingController {
	async getAllVotings(req: Request, res: Response) {
		try {
			const votings = await Voting.find().sort({ createdAt: -1 })
			res.json({ success: true, data: votings })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getVotingById(req: Request, res: Response) {
		try {
			const { votingId } = req.params
			let voting = await Voting.findOne({ votingId: Number(votingId) })

			// If not in DB, fetch from contract
			if (!voting) {
				const quadraticVoting = new ethers.Contract(
					CONTRACTS.QUADRATIC_VOTING,
					[
						'function votings(uint256) view returns (address vault, address nominee, string memory nomineeName, string memory role, string memory description, uint256 startTime, uint256 endTime, uint256 votesFor, uint256 votesAgainst, uint256 totalVotes, bool isActive, bool isApproved)',
					],
					provider
				)
				const votingData = await quadraticVoting.votings(votingId)
				voting = await Voting.create({
					votingId: Number(votingId),
					vault: votingData.vault,
					nominee: votingData.nominee,
					nomineeName: votingData.nomineeName,
					description: votingData.description,
					startTime: new Date(Number(votingData.startTime) * 1000),
					endTime: new Date(Number(votingData.endTime) * 1000),
					votesFor: Number(votingData.votesFor),
					votesAgainst: Number(votingData.votesAgainst),
					totalVotes: Number(votingData.totalVotes),
					isActive: votingData.isActive,
					isApproved: votingData.isApproved,
				})
			}

			res.json({ success: true, data: voting })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getActiveVotings(req: Request, res: Response) {
		try {
			const now = new Date()
			const votings = await Voting.find({
				isActive: true,
				endTime: { $gt: now },
			}).sort({ endTime: 1 })
			res.json({ success: true, data: votings })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getPastVotings(req: Request, res: Response) {
		try {
			const now = new Date()
			const votings = await Voting.find({
				$or: [{ isActive: false }, { endTime: { $lte: now } }],
			}).sort({ endTime: -1 })
			res.json({ success: true, data: votings })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async syncVotings(req: Request, res: Response) {
		try {
			const quadraticVoting = new ethers.Contract(
				CONTRACTS.QUADRATIC_VOTING,
				[
					'function getAllVotingIds() view returns (uint256[] memory ids)',
					'function votings(uint256) view returns (address vault, address nominee, string memory nomineeName, string memory role, string memory description, uint256 startTime, uint256 endTime, uint256 votesFor, uint256 votesAgainst, uint256 totalVotes, bool isActive, bool isApproved)',
				],
				provider
			)
			const votingIds = await quadraticVoting.getAllVotingIds()

			const syncedVotings = []
			for (const votingId of votingIds) {
				const existing = await Voting.findOne({ votingId: Number(votingId) })
				if (!existing) {
					const votingData = await quadraticVoting.votings(votingId)
					const voting = await Voting.create({
						votingId: Number(votingId),
						vault: votingData.vault,
						nominee: votingData.nominee,
						nomineeName: votingData.nomineeName,
						description: votingData.description,
						startTime: new Date(Number(votingData.startTime) * 1000),
						endTime: new Date(Number(votingData.endTime) * 1000),
						votesFor: Number(votingData.votesFor),
						votesAgainst: Number(votingData.votesAgainst),
						totalVotes: Number(votingData.totalVotes),
						isActive: votingData.isActive,
						isApproved: votingData.isApproved,
					})
					syncedVotings.push(voting)
				}
			}

			res.json({ success: true, data: syncedVotings, message: `Synced ${syncedVotings.length} votings` })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}
}

export const votingController = new VotingController()

