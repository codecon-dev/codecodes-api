import { ErrorResponseModel, RequestResult, StatsRequestResult } from '../types'
import { Controller, Get, Route, Security, Response } from 'tsoa'
import { getStats } from '../services/stats'

@Route('/stats')
export class StatsController extends Controller {
  @Response<ErrorResponseModel>('401', 'Unauthorized', {
    statusCode: 401,
    message: 'Wrong or missing apikey'
  })

  @Security("api_key")
  @Get('/')
  public async getStats (): Promise<StatsRequestResult|RequestResult> {
    try {
      const stats = await getStats()
      return {
        status: 'success',
        message: 'Informações obtidas com sucesso',
        statusCode: 200,
        data: {
          ...stats,
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
