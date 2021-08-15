import { Request, Router, Response } from 'express'
import swaggerUi from "swagger-ui-express"
import fs from 'fs'

const router = Router()

router.use(swaggerUi.serve, async (request: Request, response: Response) => {
  const swaggerJsonPath = "src/swagger.json"
  if (!fs.existsSync(swaggerJsonPath)) {
    return response.send('Swagger File was not generated.')
  }
  const swaggerJsonRelativePath = "../swagger.json"
  const swaggerJson = await import(swaggerJsonRelativePath)
  return response.send(swaggerUi.generateHTML(swaggerJson))
})

export default router