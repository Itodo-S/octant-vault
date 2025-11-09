import { Router } from 'express'
import { votingController } from '../controllers/votingController'

export const votingRoutes = Router()

votingRoutes.get('/', (req, res) => votingController.getAllVotings(req, res))
votingRoutes.get('/sync', (req, res) => votingController.syncVotings(req, res))
votingRoutes.get('/active', (req, res) => votingController.getActiveVotings(req, res))
votingRoutes.get('/past', (req, res) => votingController.getPastVotings(req, res))
votingRoutes.get('/:votingId', (req, res) => votingController.getVotingById(req, res))

