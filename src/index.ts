import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import token from './routes/token'
import middlewares from './middewares'

const PORT = process.env.PORT || 8080

try {
  const app = express()

  app.use(cors())
  app.use(logger('dev'))
  app.use(express.json())

  app.use('/token', token)

  app.use(middlewares.notFound)
  app.use(middlewares.errorHandler)

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
  })
} catch (error) {
  console.error(error)
}