import { Router } from 'express'
import { StatsController } from '../controllers/stats'
import middlewares from '../middlewares'

const router = Router()

router.get("/", middlewares.authentication, async (request, response, next) => {
  try {
    const controller = new StatsController()
    const claimResult = await controller.getStats()
    return response.status(claimResult.statusCode || 200).send(claimResult)
  } catch (error) {
    next(error)
  }
})

export default router