import { Router } from 'express'
import { distributionController } from '../controllers/distributionController'

export const distributionRoutes = Router()

distributionRoutes.get('/', (req, res) => distributionController.getAllDistributions(req, res))
distributionRoutes.get('/sync', (req, res) => distributionController.syncDistributions(req, res))
distributionRoutes.get('/upcoming', (req, res) => distributionController.getUpcomingDistributions(req, res))
distributionRoutes.get('/recent', (req, res) => distributionController.getRecentDistributions(req, res))
distributionRoutes.get('/:scheduleId', (req, res) => distributionController.getDistributionById(req, res))

