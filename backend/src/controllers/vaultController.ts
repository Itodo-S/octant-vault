import { Request, Response } from 'express'
import { Vault } from '../models/Vault'
import { contractService } from '../services/contractService'

export class VaultController {
	async getAllVaults(req: Request, res: Response) {
		try {
			const vaults = await Vault.find().sort({ createdAt: -1 })
			res.json({ success: true, data: vaults })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getVaultById(req: Request, res: Response) {
		try {
			const { address } = req.params
			
			// Validate address format
			if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
				return res.status(400).json({ success: false, error: 'Invalid vault address format' })
			}

			let vault = await Vault.findOne({ address })

			// If not in DB, try to fetch from contract
			if (!vault) {
				try {
					const vaultInfo = await contractService.getVaultInfo(address)
					vault = await Vault.create({
						address,
						...vaultInfo,
					})
				} catch (contractError: any) {
					// If contract call fails, return error with helpful message
					// Check if this is one of our known contract addresses
					const knownContracts = {
						'0x79dA447bF4A8f5603AeA849c16A96acF4af1f1ea': 'ContributorRegistry',
						'0x1D15e3471efA08d6CfC2BCb7E8b76C4185d000d0': 'QuadraticVoting',
						'0xF846B2Dc610b3A9B6b2d15F9BD217048E5E7F550': 'Distribution',
						'0xf149D831aBfbe9bC46218eF2086585FE00eA6655': 'VaultFactory',
						'0x485900c8262F08057D165e5F5DdfaB306b8Fc96e': 'SparkVaultFactory',
					}
					
					const contractName = knownContracts[address as keyof typeof knownContracts]
					
					return res.status(404).json({
						success: false,
						error: contractName 
							? `Address ${address} is the ${contractName} contract, not a vault. Use /api/v1/vaults/sync to get valid vault addresses.`
							: `Vault not found at address ${address}. It may not be deployed or may not be a valid vault contract. Use /api/v1/vaults/sync to get valid vault addresses.`,
						details: contractError.message,
						hint: 'Try calling GET /api/v1/vaults/sync first to sync and get all valid vault addresses',
					})
				}
			}

			res.json({ success: true, data: vault })
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async syncVaults(req: Request, res: Response) {
		try {
			const vaultAddresses = await contractService.getAllVaults()
			const syncedVaults = []
			const updatedVaults = []
			const errors: string[] = []

			for (const address of vaultAddresses) {
				try {
					const existing = await Vault.findOne({ address })
					const vaultInfo = await contractService.getVaultInfo(address)
					
					if (existing) {
						// Update existing vault
						existing.name = vaultInfo.name
						existing.description = vaultInfo.description
						existing.totalAssets = vaultInfo.totalAssets
						existing.totalSupply = vaultInfo.totalSupply
						existing.asset = vaultInfo.asset
						existing.deployer = vaultInfo.deployer
						await existing.save()
						updatedVaults.push(existing)
					} else {
						// Create new vault
						const vault = await Vault.create({
							address,
							...vaultInfo,
						})
						syncedVaults.push(vault)
					}
				} catch (error: any) {
					// Check if it's an invalid vault (doesn't implement getVaultInfo)
					const isInvalidVault = error.message?.includes('does not implement getVaultInfo')
					const errorMessage = isInvalidVault 
						? `Vault ${address} does not implement getVaultInfo() - skipping`
						: `Failed to sync vault ${address}: ${error.message}`
					
					errors.push(errorMessage)
				}
			}

			res.json({
				success: true,
				data: syncedVaults,
				updated: updatedVaults,
				message: `Synced ${syncedVaults.length} new vault(s), updated ${updatedVaults.length} existing vault(s)`,
				errors: errors.length > 0 ? errors : undefined,
			})
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}

	async getVaultAddresses(req: Request, res: Response) {
		try {
			const vaultAddresses = await contractService.getAllVaults()
			res.json({
				success: true,
				data: vaultAddresses,
				count: vaultAddresses.length,
				message: vaultAddresses.length === 0 
					? 'No vaults deployed yet. Use VaultFactory or SparkVaultFactory to create vaults.'
					: `Found ${vaultAddresses.length} vault(s)`,
			})
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message })
		}
	}
}

export const vaultController = new VaultController()

