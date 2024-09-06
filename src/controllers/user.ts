import { Controller, Get, Response, Route, Security } from 'tsoa'
import { getRankService } from '../services/rank'
import { checkForSuspiciousActivity, getDatabaseUserById, getDatabaseUsers } from '../services/user'
import {
  ErrorResponseModel,
  RankRequestResult,
  RequestResult,
  User
} from '../types'

@Route('/user')
@Security('api_key')
export class UserController extends Controller {
  @Response<ErrorResponseModel>('401', 'Unauthorized', {
    statusCode: 401,
    message: 'Wrong or missing apikey'
  })
  @Security('api_key')
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

  @Response<ErrorResponseModel>('404', 'Not Found', {
    statusCode: 404,
    message: 'Usuário não encontrado'
  })
  @Security('api_key')
  @Get('{userId}')
  public async getUser(userId: string): Promise<User> {
    try {
      const user = await getDatabaseUserById(userId)
      return user
    } catch (error) {
      console.log(error)
    }
  }

  @Response<ErrorResponseModel>('500', 'Internal Server Error', {
    statusCode: 500,
    message: 'An error occurred while processing the request'
  })
  @Security('api_key')
  @Get('/susp/check')
  public async getSuspiciousActivity(): Promise<any[]> {
    try {
      const suspiciousUsers = await checkForSuspiciousActivity()
      return suspiciousUsers
    } catch (error) {
      console.log(error)
      this.setStatus(500)
      return []
    }
  }
}
