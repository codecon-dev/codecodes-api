import { ErrorResponseModel, RankRequestResult, RequestResult } from '../types'
import { Controller, Get, Route, Security, Response } from 'tsoa'
import rankService from '../services/rank'

@Route('/user')
export class UserController extends Controller {
  @Response<ErrorResponseModel>('401', 'Unauthorized', {
    status: 401,
    message: 'Wrong or missing apikey'
  })
  @Security("api_key")
  @Get('/rank')
  public async getRank (): Promise<RankRequestResult|RequestResult> {
    try {
      const rankResult = await rankService()
      return rankResult
    } catch (error) {
      console.log(error)
    }
  }
}
