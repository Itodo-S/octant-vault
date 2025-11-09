import { Router } from 'express'
import { contributorController } from '../controllers/contributorController'

export const contributorRoutes = Router()

contributorRoutes.get('/', (req, res) => contributorController.getAllContributors(req, res))
contributorRoutes.get('/vault/:vaultAddress', (req, res) => contributorController.getVaultContributors(req, res))

