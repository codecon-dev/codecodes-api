import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import middlewares from './middlewares'
import token from './routes/token'
import user from './routes/user'
import stats from './routes/stats'
import docs from './routes/docs'
import time from './routes/time'

const PORT = process.env.PORT || 8080

try {
  const app = express()

  app.use(cors())
  app.use(logger('dev'))
  app.use(express.json())

  app.use('/token', token)
  app.use('/user', user)
  app.use('/stats', stats)
  app.use('/docs', docs)
  app.use('/time', time)

  app.use(middlewares.notFound)
  app.use(middlewares.errorHandler)

  console.log(process.env.APIKEY)

  app.listen(PORT, () => {
    console.log(
      `Server is running on port ${PORT} (http://localhost:${PORT}/docs)`
    )
  })
} catch (error) {
  console.error(error)
}
