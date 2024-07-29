import { Request, Response, NextFunction } from 'express'

export function setHasPartnerAuth(_request: Request, response: Response, next: NextFunction): void {
  response.locals['has-partner-auth'] = true
  next()
}
