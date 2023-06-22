// src/routes/time.ts
import { Router } from 'express'
import { TimeController } from '../controllers/time'

const router = Router()

router.get("/now", async (request, response, next) => {
  try {
    const controller = new TimeController()
    const currentTime = controller.getCurrentTime()
    return response.send(currentTime)
  } catch (error) {
    next(error)
  }
})

export default router
