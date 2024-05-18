import { Controller, Post, Get, Route, Body, Security, Response } from 'tsoa'
import {
  ErrorResponseModel,
  ITokenClaimPayload,
  ITokenPayload,
  RequestResult,
  ClaimRequestResult,
  NonClaimedTokensRequestResult,
  Token
} from '../types'
import {
  getNonClaimedTokensByUser,
  getDatabaseTokenByCode,
  getDatabaseTokens,
  crateDatabaseToken
} from '../services/token'
import claimService from '../services/claim'

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

  @Response<ErrorResponseModel>('404', 'Not Found', {
    statusCode: 404,
    message: 'Token não encontrado',
  })
  @Security('api_key')
  @Get('{tokenId}')
  public async getToken(tokenId: string): Promise<Token | RequestResult> {
    try {
      const token = await getDatabaseTokenByCode(tokenId)
      return token
    } catch (error) {
      console.log(error)
    }
  }

  @Security('api_key')
  @Get('/')
  public async getAllTokens(): Promise<Token[] | RequestResult> {
    try {
      const tokens = await getDatabaseTokens(true)
      return tokens
    } catch (error) {
      console.log(error)
    }
  }

  @Response<ErrorResponseModel>('409', 'Conflict', {
    statusCode: 409,
    message: 'Token já existe',
  })
  @Security("api_key")
  @Post('/')
  public async create(@Body() body: ITokenPayload): Promise<Token | RequestResult> {
    try {
      const token = await crateDatabaseToken(body)
      if (token) return token
    } catch (error) {
      console.log(error)
    }
  }
}
