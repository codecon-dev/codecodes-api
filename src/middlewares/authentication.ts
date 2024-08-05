import { NextFunction, Request, Response } from 'express'
import { parseResponseResult } from '../common/parseResponseResult'

export function authentication(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  try {
    const hasPartnerAuthentication = response.locals['has-partner-auth']
    const partnerApiKey = request.headers['x-partnerapikey']
    let apiKeyErrorMessage = 'Wrong or missing apikey'
    let providedApiKey = request.headers['x-apikey']
    let requiredApiKey = [process.env.APIKEY]

    if (hasPartnerAuthentication && partnerApiKey) {
      providedApiKey = partnerApiKey
      requiredApiKey = [
        process.env.SOFT_EXPERT_APIKEY,
        process.env.SUPER_VIZ_APIKEY
      ]
      apiKeyErrorMessage = 'Wrong or missing partner apikey'
    }
    if (!requiredApiKey.includes(providedApiKey as string))
      throw new Error(apiKeyErrorMessage)
    next()
  } catch (error) {
    response.json(parseResponseResult(error, error.message))
  }
}
