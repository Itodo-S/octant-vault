import { Request, Response } from 'express'
import { Contributor } from '../models/Contributor'
import { contractService } from '../services/contractService'

export class ContributorController {
	async getVaultContributors(req: Request, res: Response) {
		try {
			const { vaultAddress } = req.params
			let contributors = await Contributor.find({ vault: vaultAddress, isActive: true })

			// If not in DB, fetch from contract
			if (contributors.length === 0) {
				const contributorAddresses = await contractService.getVaultContributors(vaultAddress)
				for (const address of contributorAddresses) {
					const contributorInfo = await contractService.getContributor(vaultAddress, address)
					const contributor = await Contributor.create({
						vault: vaultAddress,
						wallet: address,
						...contributorInfo,
					})
					contributors.push(contributor)
				}
			}

			res.json({ success: true, data: contributors })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getAllContributors(req: Request, res: Response) {
		try {
			const contributors = await Contributor.find({ isActive: true }).sort({ createdAt: -1 })
			res.json({ success: true, data: contributors })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}
}

export const contributorController = new ContributorController()

