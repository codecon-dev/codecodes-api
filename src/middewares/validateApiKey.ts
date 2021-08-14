import { NextFunction, Request, Response } from 'express'

export function validateApiKey (request: Request, response: Response, next: NextFunction): void {
  try {
    const apiKey = request.headers['x-apikey']
    if (apiKey !== process.env.APIKEY) {
      throw new Error('Wrong or missing apikey')
    }
    next()
  } catch (error) {
    response.json({
      status: 'error',
      message: error.message
    })
  }
}