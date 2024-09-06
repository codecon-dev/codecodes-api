import { Router } from 'express'
import { UserController } from '../controllers/user'
import middlewares from '../middlewares'

const router = Router()

router.get(
  '/rank',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const controller = new UserController()
      const rankResult = await controller.getRank()
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

router.get(
  '/susp/check',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const controller = new UserController()
      const suspiciousUsers = await controller.getSuspiciousActivity()
      return response.send(suspiciousUsers)
    } catch (error) {
      next(error)
    }
  }
)

export default router
