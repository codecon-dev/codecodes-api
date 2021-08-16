import { Router } from 'express'
import { UserController } from '../controllers/user'
import middlewares from '../middlewares'

const router = Router()

router.get("/rank", middlewares.authentication, async (request, response, next) => {
  try {
    const controller = new UserController()
    const rankResult = await controller.getRank()
    return response.send(rankResult)
  } catch (error) {
    next(error)
  }
})

export default router