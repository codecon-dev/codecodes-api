import { Body, Controller, Get, Post, Response, Route, Security } from 'tsoa'
import { getRankService } from '../services/rank'
import {
  checkForSuspiciousActivity,
  getDatabaseUserById,
  getDatabaseUsers,
  softDeleteUserById
} from '../services/user'
import {
  ErrorResponseModel,
  RankRequestResult,
  RequestResult,
  SoftDeleteResult,
  User,
  UserResponse
} from '../types'

@Route('/user')
@Security('api_key')
export class UserController extends Controller {
  @Response<ErrorResponseModel>('401', 'Unauthorized', {
    statusCode: 401,
    message: 'Wrong or missing apikey'
  })
  @Security('api_key')
  @Get('/rank/{userId}')
  public async getRank(
    userId: string
  ): Promise<RankRequestResult | RequestResult> {
    try {
      const users = await getDatabaseUsers()
      const rankResult = await getRankService(users, userId)
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
  public async getUser(userId: string): Promise<UserResponse> {
    try {
      const user = await getDatabaseUserById(userId)

      if (!user) {
        this.setStatus(404)
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        }
      }

      return {
        success: true,
        message: 'User found',
        statusCode: 200,
        user
      }
    } catch (error) {
      this.setStatus(500)
      console.log(error)

      return {
        success: false,
        statusCode: 500,
        message: 'An error occurred while searching the user'
      }
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

  @Response<ErrorResponseModel>('404', 'Not Found', {
    statusCode: 404,
    message: 'Usuário não encontrado'
  })
  @Security('api_key')
  @Post('/susp/softdelete')
  public async softDeleteUser(
    @Body() body: { userId: string }
  ): Promise<SoftDeleteResult> {
    try {
      const { userId } = body
      const result = await softDeleteUserById(userId)
      return result
    } catch (error) {
      console.log(error)
      return {
        success: false,
        message: 'An error occurred while soft deleting the user'
      }
    }
  }
}
