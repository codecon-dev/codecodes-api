import { ErrorResponseModel, ITokenClaimPayload, RequestResult, ClaimRequestResult, NonClaimedTokensRequestResult } from '../types'
import { Controller, Post, Get, Route, Body, Security, Response } from 'tsoa'
import claimService from '../services/claim'
import { getNonClaimedTokensByUser } from '../services/token'

@Route('/token')
@Security('api_key')
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
  public async claim(@Body() body: ITokenClaimPayload): Promise<ClaimRequestResult | RequestResult> {
    try {
      const { code, email: userId, name: tag } = body
      const claimResult = await claimService(code, userId, tag)
      return claimResult
    } catch (error) {
      console.log(error)
    }
  }

  @Response<ErrorResponseModel>('404', 'Not Found', {
    statusCode: 404,
    message: 'Usuário não encontrado'
  })
  @Security("api_key")
  @Get('/notClaimedByUser/{userId}')
  public async getUserNotClaimedTokens(userId: string): Promise<NonClaimedTokensRequestResult | RequestResult> {
    try {
      const nonClaimedTokensResult = await getNonClaimedTokensByUser(userId)
      return nonClaimedTokensResult
    } catch (error) {
      console.log(error)
    }
  }
}
