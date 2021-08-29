import { ErrorResponseModel, RankRequestResult, RequestResult } from '../types'
import { Controller, Get, Route, Security, Response } from 'tsoa'
import { getRankService } from '../services/rank'
import { getDatabaseUsers } from '../services/user'

@Route('/user')
export class UserController extends Controller {
  @Response<ErrorResponseModel>('401', 'Unauthorized', {
    status: 401,
    message: 'Wrong or missing apikey'
  })
  @Security("api_key")
  @Get('/rank')
  public async getRank(): Promise<RankRequestResult | RequestResult> {
    try {
      const users = await getDatabaseUsers()
      const rankResult = await getRankService(users)
      return rankResult
    } catch (error) {
      console.log(error)
    }
  }
}
