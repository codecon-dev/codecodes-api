import { NextFunction, Request, Response, Router } from 'express'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { parseResponseResult } from '../common/parseResponseResult'
import { MulterRequest, TokenController } from '../controllers/token'
import middlewares from '../middlewares'
import { ITokenClaimPayload } from '../types'

const router = Router()
const upload = multer({ dest: 'uploads/' })

// Custom store for rate limiting based on email
class EmailStore {
  private store: any

  constructor() {
    this.store = new Map()
  }

  incr(key: string, cb: any): void {
    const now = Date.now()
    const record = this.store.get(key) || { count: 0, resetTime: now + 60000 }

    if (now > record.resetTime) {
      record.count = 1
      record.resetTime = now + 60000
    } else {
      record.count++
    }

    this.store.set(key, record)
    cb(null, record.count)
  }

  decrement(key: string): void {
    const record = this.store.get(key)
    if (record) {
      record.count = Math.max(0, record.count - 1)
    }
  }

  resetKey(key: string): void {
    this.store.delete(key)
  }

  resetAll(): void {
    this.store.clear()
  }
}

const emailStore = new EmailStore()

const claimLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each email to 20 requests per windowMs
  handler: (req, res) => {
    const result = parseResponseResult('error', 'Too many attempts, please try again later.', 429)
    res.status(result.statusCode).json(result)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    const body = req.body as ITokenClaimPayload
    return body.email || req.ip // Fallback to IP if email is not provided
  },
  store: emailStore as any
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
