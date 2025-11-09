import { Router } from 'express'
import { vaultRoutes } from './vaultRoutes'
import { contributorRoutes } from './contributorRoutes'
import { votingRoutes } from './votingRoutes'
import { distributionRoutes } from './distributionRoutes'

export const routes = Router()

routes.use('/vaults', vaultRoutes)
routes.use('/contributors', contributorRoutes)
routes.use('/votings', votingRoutes)
routes.use('/distributions', distributionRoutes)

