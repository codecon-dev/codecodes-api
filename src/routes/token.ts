import { Router } from 'express'
import { TokenController } from '../controllers/token'
import middlewares from '../middlewares'

const router = Router()

router.post("/claim", middlewares.authentication, async (request, response, next) => {
  try {
    const controller = new TokenController()
    const claimResult = await controller.claim(request.body)
    return response.send(claimResult)
  } catch (error) {
    next(error)
  }
})

export default router