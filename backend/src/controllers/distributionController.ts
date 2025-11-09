import { Request, Response } from 'express'
import { Distribution } from '../models/Distribution'
import { ethers } from 'ethers'
import { CONTRACTS } from '../config/contracts'

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.base.org')

export class DistributionController {
	async getAllDistributions(req: Request, res: Response) {
		try {
			const distributions = await Distribution.find().sort({ scheduledTime: -1 })
			res.json({ success: true, data: distributions })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getDistributionById(req: Request, res: Response) {
		try {
			const { scheduleId } = req.params
			let distribution = await Distribution.findOne({ scheduleId: Number(scheduleId) })

			// If not in DB, fetch from contract
			if (!distribution) {
				const distributionContract = new ethers.Contract(
					CONTRACTS.DISTRIBUTION,
					[
						'function getSchedule(uint256) view returns (tuple(address vault, uint256 scheduledTime, uint256 distributionAmount, address[] recipients, uint256[] amounts, uint8 method, bool isExecuted, uint256 executionTime, bytes32 txHash) memory schedule)',
					],
					provider
				)
				const distData = await distributionContract.getSchedule(scheduleId)
				distribution = await Distribution.create({
					scheduleId: Number(scheduleId),
					vault: distData.vault,
					scheduledTime: new Date(Number(distData.scheduledTime) * 1000),
					distributionMethod: Number(distData.method),
					executed: distData.isExecuted,
					executedAt: distData.isExecuted ? new Date(Number(distData.executionTime) * 1000) : null,
					totalAmount: distData.distributionAmount.toString(),
					recipientCount: distData.recipients.length,
				})
			}

			res.json({ success: true, data: distribution })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getUpcomingDistributions(req: Request, res: Response) {
		try {
			const now = new Date()
			const distributions = await Distribution.find({
				executed: false,
				scheduledTime: { $gt: now },
			}).sort({ scheduledTime: 1 })
			res.json({ success: true, data: distributions })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getRecentDistributions(req: Request, res: Response) {
		try {
			const distributions = await Distribution.find({
				executed: true,
			})
				.sort({ executedAt: -1 })
				.limit(50)
			res.json({ success: true, data: distributions })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async syncDistributions(req: Request, res: Response) {
		try {
			const distributionContract = new ethers.Contract(
				CONTRACTS.DISTRIBUTION,
				[
					'function getAllScheduleIds() view returns (uint256[] memory ids)',
					'function getSchedule(uint256) view returns (tuple(address vault, uint256 scheduledTime, uint256 distributionAmount, address[] recipients, uint256[] amounts, uint8 method, bool isExecuted, uint256 executionTime, bytes32 txHash) memory schedule)',
				],
				provider
			)
			const scheduleIds = await distributionContract.getAllScheduleIds()

			const syncedDistributions = []
			for (const scheduleId of scheduleIds) {
				const existing = await Distribution.findOne({ scheduleId: Number(scheduleId) })
				if (!existing) {
					const distData = await distributionContract.getSchedule(scheduleId)
					const distribution = await Distribution.create({
						scheduleId: Number(scheduleId),
						vault: distData.vault,
						scheduledTime: new Date(Number(distData.scheduledTime) * 1000),
						distributionMethod: Number(distData.method),
						executed: distData.isExecuted,
						executedAt: distData.isExecuted ? new Date(Number(distData.executionTime) * 1000) : null,
						totalAmount: distData.distributionAmount.toString(),
						recipientCount: distData.recipients.length,
					})
					syncedDistributions.push(distribution)
				}
			}

			res.json({ success: true, data: syncedDistributions, message: `Synced ${syncedDistributions.length} distributions` })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}
}

export const distributionController = new DistributionController()

