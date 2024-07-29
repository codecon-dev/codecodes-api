import { Router } from 'express'
import multer from 'multer'
import { MulterRequest, TokenController } from '../controllers/token'
import middlewares from '../middlewares'

const router = Router()
const upload = multer({ dest: 'uploads/' })

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

router.get("/:tokenId", middlewares.authentication, async (request, response, next) => {
  try {
    const { tokenId } = request?.params
    const controller = new TokenController()
    const token = await controller.getToken(tokenId)
    return response.send(token)
  } catch (error) {
    next(error)
  }
})

router.put("/:tokenId", middlewares.authentication, async (request, response, next) => {
  try {
    const { tokenId } = request?.params
    const controller = new TokenController()
    const token = await controller.updateToken(tokenId, request.body)
    return response.send(token)
  } catch (error) {
    next(error)
  }
})

router.get("/", middlewares.authentication, async (request, response, next) => {
  try {
    const controller = new TokenController()
    const tokens = await controller.getAllTokens()
    return response.send(tokens)
  } catch (error) {
    next(error)
  }
})

router.use('/import', upload.single('csv'))
router.post("/import", middlewares.authentication, async (request: MulterRequest, response, next) => {
  try {
    const controller = new TokenController()
    const importResult = await controller.importTokens(request)
    return response.status(importResult.statusCode || 200).send(importResult)
  } catch (error) {
    next(error)
  }
})

router.post("/batch", middlewares.authentication, async (request, response, next) => {
  try {
    const controller = new TokenController()
    const importResult = await controller.batchCreate(request.body)
    return response.status(importResult.statusCode || 200).send(importResult)
  } catch (error) {
    next(error)
  }
})

router.post("/", [middlewares.setHasPartnerAuth, middlewares.authentication], async (request, response, next) => {
  try {
    const controller = new TokenController()
    const requestResult = await controller.create(request.body)
    return response.status(requestResult.statusCode || 200).send(requestResult)
  } catch (error) {
    next(error)
  }
})

export default router