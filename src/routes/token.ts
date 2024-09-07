import { NextFunction, Request, Response, Router } from 'express'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { parseResponseResult } from '../common/parseResponseResult'
import { MulterRequest, TokenController } from '../controllers/token'
import middlewares from '../middlewares'

const router = Router()
const upload = multer({ dest: 'uploads/' })

const claimLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per windowMs
  handler: (req, res) => {
    const result = parseResponseResult('error', 'Too many attempts', 429)
    res.status(result.statusCode).json(result)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

router.post(
  '/claim',
  middlewares.authentication,
  claimLimiter,
  async (request, response, next) => {
    try {
      const controller = new TokenController()
      const claimResult = await controller.claim(request.body)
      return response.status(claimResult.statusCode || 200).send(claimResult)
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/notClaimedByUser/:userId',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const { userId } = request.params
      const controller = new TokenController()
      const user = await controller.getUserNotClaimedTokens(userId)
      return response.send(user)
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:tokenId',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const { tokenId } = request?.params
      const controller = new TokenController()
      const token = await controller.getToken(tokenId)
      return response.send(token)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:tokenId',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const { tokenId } = request?.params
      const controller = new TokenController()
      const token = await controller.updateToken(tokenId, request.body)
      return response.send(token)
    } catch (error) {
      next(error)
    }
  }
)

router.get('/', middlewares.authentication, async (request, response, next) => {
  try {
    const controller = new TokenController()
    const tokens = await controller.getAllTokens()
    return response.send(tokens)
  } catch (error) {
    next(error)
  }
})

router.use('/import', upload.single('csv'))
router.post(
  '/import',
  middlewares.authentication,
  async (request: MulterRequest, response, next) => {
    try {
      const controller = new TokenController()
      const importResult = await controller.importTokens(request)
      return response.status(importResult.statusCode || 200).send(importResult)
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/batch',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const controller = new TokenController()
      const importResult = await controller.batchCreate(request.body)
      return response.status(importResult.statusCode || 200).send(importResult)
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const controller = new TokenController()
      const requestResult = await controller.create(request.body)
      return response
        .status(requestResult.statusCode || 200)
        .send(requestResult)
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/partner',
  [middlewares.setHasPartnerAuth, middlewares.authentication],
  claimLimiter,
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const controller = new TokenController()
      const requestResult = await controller.createByPartner()
      return response
        .status(requestResult.statusCode || 200)
        .send(requestResult)
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/revert-user-claims',
  middlewares.authentication,
  async (request, response, next) => {
    try {
      const controller = new TokenController()
      const result = await controller.revertUserClaims(request.body)
      return response.status(result.statusCode || 200).send(result)
    } catch (error) {
      next(error)
    }
  }
)

export default router
