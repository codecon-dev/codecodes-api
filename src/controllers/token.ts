import { ErrorResponseModel, ITokenClaimPayload, RequestResult } from '../types'
import { Controller, Post, Route, Body, Security, Response } from 'tsoa'
import claimService from '../services/claim'
@Route('/token')
export class TokenController extends Controller {
  @Response<ErrorResponseModel>('401', 'Unauthorized', {
    status: 401,
    message: 'Wrong or missing apikey'
  })
  @Security("api_key")
  @Post('/claim')
  public async claim (@Body() body: ITokenClaimPayload): Promise<RequestResult> {
    try {
      const { code, email: userId, name: tag } = body
      const claimResult = await claimService(code, userId, tag)
      return claimResult
    } catch (error) {
      console.log(error)
    }
  }
}
