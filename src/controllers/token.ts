import { Request as ExpressRequest } from 'express'
import {
  Controller,
  Post,
  Get,
  Route,
  Body,
  Security,
  Response,
  Request,
  Put,
  Path
} from 'tsoa'
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
  createDatabaseToken,
  updateDatabaseToken,
  importTokens,
  batchCreate
} from '../services/token'
import claimService from '../services/claim'

export interface MulterRequest extends ExpressRequest {
  file: Express.Multer.File
}
@Route('/token')
@Security({ api_key: [], partner_api_key: [] })
export class TokenController extends Controller {
  @Response<ErrorResponseModel>('401', 'Unauthorized', {
    statusCode: 401,
    message: 'Wrong or missing apikey'
  })
  @Response<ErrorResponseModel>('422', 'Unprocessable Entity', {
    statusCode: 422,
    message: 'Código não encontrado'
  })
  @Security('api_key')
  @Post('/claim')
  public async claim(
    @Body() body: ITokenClaimPayload
  ): Promise<ClaimRequestResult | RequestResult> {
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
  @Security('api_key')
  @Get('/notClaimedByUser/{userId}')
  public async getUserNotClaimedTokens(
    userId: string
  ): Promise<NonClaimedTokensRequestResult | RequestResult> {
    try {
      const nonClaimedTokensResult = await getNonClaimedTokensByUser(userId)
      return nonClaimedTokensResult
    } catch (error) {
      console.log(error)
    }
  }

  @Response<ErrorResponseModel>('404', 'Not Found', {
    statusCode: 404,
    message: 'Token não encontrado'
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
    message: 'Token já existe'
  })
  @Security('api_key')
  @Post('/')
  public async create(@Body() body: ITokenPayload): Promise<RequestResult> {
    try {
      const requestResult = await createDatabaseToken(body)
      return requestResult
    } catch (error) {
      console.log(error)
    }
  }

  @Security('partner_api_key')
  @Post('/partner')
  public async createByPartner(): Promise<RequestResult> {
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      const requestResult = await createDatabaseToken({
        code,
        value: Number(process.env.PARTNER_CODE_VALUE) || 0,
        description: 'Código aleatório gerado para parceiro',
        expireAt: '2024-09-07T18:00:00.00Z',
        totalClaims: 1
      })
      return requestResult
    } catch (error) {
      console.log(error)
    }
  }

  @Security('api_key')
  @Put('/{tokenId}')
  public async updateToken(
    @Path('tokenId') tokenId: string,
    @Body() token: Token
  ): Promise<RequestResult> {
    try {
      const result = await updateDatabaseToken(token, tokenId)
      return result
    } catch (error) {
      console.log(error)
    }
  }

  @Security('api_key')
  @Post('/import')
  public async importTokens(
    @Request() req: MulterRequest
  ): Promise<RequestResult> {
    try {
      const result = importTokens(req)
      return result
    } catch (error) {
      console.log(error)
    }
  }

  @Security('api_key')
  @Post('/batch')
  public async batchCreate(
    @Body() tokens: ITokenPayload[]
  ): Promise<RequestResult> {
    try {
      const result = batchCreate(tokens)
      return result
    } catch (error) {
      console.log(error)
    }
  }
}
