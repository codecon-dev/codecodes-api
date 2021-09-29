import { Router } from 'express'
import { TokenController } from '../controllers/token'
import middlewares from '../middlewares'

const router = Router()

router.post("/claim", middlewares.authentication, async (request, response, next) => {
  try {
    const controller = new TokenController()
    const claimResult = await controller.claim(request.body)
    return response.status(claimResult.statusCode || 200).send(claimResult)
  } catch (error) {
    next(error)
  }
})

router.get("/notClaimedByUser/:userId", middlewares.authentication, async (request, response, next) => {
  try {
    const { userId } = request.params
    const controller = new TokenController()
    const user = await controller.getUserNotClaimedTokens(userId)
    return response.send(user)
  } catch (error) {
    next(error)
  }
})

export default router