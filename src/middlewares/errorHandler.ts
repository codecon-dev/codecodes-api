import { Request, Response } from 'express'

export function errorHandler(
  error: Error,
  request: Request,
  response: Response
): void {
  response.status(505).json({
    message: error.message,
    stack: error.stack
  })
}
