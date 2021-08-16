import { NextFunction, Request, Response } from 'express'
import { parseResponseResult } from '../common/parseResponseResult'

export function authentication (request: Request, response: Response, next: NextFunction): void {
  try {
    const providedApiKey = request.headers['x-apikey']
    const requiredApiKey = process.env.APIKEY
    const apiKeyErrorMessage = 'Wrong or missing apikey'
    if (providedApiKey !== requiredApiKey) throw new Error(apiKeyErrorMessage)
    next()
  } catch (error) {
    response.json(parseResponseResult(error, error.message))
  }
}