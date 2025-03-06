import { Router } from 'express'
import { UserController } from '../controllers/user'
import middlewares from '../middlewares'

const router = Router()

router.get(
  '/rank/:userId',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const controller = new UserController()
      const { userId } = request?.params
      const rankResult = await controller.getRank(userId)
      return response.send(rankResult)
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:userId',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const { userId } = request?.params
      const controller = new UserController()
      const user = await controller.getUser(userId)
      return response.send(user)
    } catch (error) {
      next(error)
    }
  }
)

export default router
