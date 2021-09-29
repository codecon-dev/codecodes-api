import { ErrorResponseModel, ITokenClaimPayload, RequestResult, ClaimRequestResult } from '../types'
import { Controller, Post, Route, Body, Security, Response } from 'tsoa'
import claimService from '../services/claim'

@Route('/token')
export class TokenController extends Controller {
  @Response<ErrorResponseModel>('401', 'Unauthorized', {
    statusCode: 401,
    message: 'Wrong or missing apikey'
  })

  @Response<ErrorResponseModel>('422', 'Unprocessable Entity', {
    statusCode: 422,
    message: 'Código não encontrado'
  })
  @Security("api_key")
  @Post('/claim')
  public async claim (@Body() body: ITokenClaimPayload): Promise<ClaimRequestResult|RequestResult> {
    try {
      const { code, email: userId, name: tag } = body
      const claimResult = await claimService(code, userId, tag)
      return claimResult
    } catch (error) {
      console.log(error)
    }
  }
}
