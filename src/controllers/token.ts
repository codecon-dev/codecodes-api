import { ErrorResponseModel, ITokenClaimPayload, RequestResult } from '../types'
import { getDatabaseTokenByCode, updateDatabaseToken } from '../services/token'
import { getDatabaseUserById, updateDatabaseUser } from '../services/user'
import { Controller, Post, Route, Body, Security, Response } from 'tsoa'
import { parseResponseResult } from '../common.ts/parseResponseResult'
import config from '../config'

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
      if (!config.claim.enabled) {
        return parseResponseResult('error', config.claim.disabledMessage)
      }

      const { code, email: userId, name: tag } = body

      if (!code) {
        return parseResponseResult('error', 'No code was provided')
      }

      const token = await getDatabaseTokenByCode(code)

      const { claimedBy, remainingClaims, value, decreaseValue, minimumValue, expireAt } = token

      if (!remainingClaims) {
        return parseResponseResult('error', 'Vish, acabaram os resgates disponíveis para esse token :(')
      }

      const isExpired = expireAt && new Date(Date.now()) > new Date(expireAt)
      if (isExpired) {
        return parseResponseResult('error', 'Esse token expirou :(')
      }

      const hasAlreadyClaimed = claimedBy.some(claimedUser => claimedUser.id === userId)
      if (hasAlreadyClaimed) {
        return parseResponseResult('error', 'Você já resgatou esse token :eyes:')
      }

      const timesClaimed = claimedBy.length
      let scoreAcquired = value - (timesClaimed * decreaseValue)
      if (scoreAcquired < minimumValue) {
        scoreAcquired = minimumValue
      }

      let userCurrentScore = 0
      let tokensClaimed = []
      const user = await getDatabaseUserById(userId)
      if (user) {
        userCurrentScore = user.score
        tokensClaimed = user.tokens
      }

      const score = {
        acquired: scoreAcquired,
        total: userCurrentScore + scoreAcquired
      }

      const date = new Date(Date.now())
      const dateString = date.toISOString()
      const claimUser = {
        tag: tag,
        id: String(userId),
        claimedAt: dateString
      }

      const updatedToken = {
        ...token,
        remainingClaims: remainingClaims - 1,
        claimedBy: claimedBy.concat(claimUser)
      }

      const updatedUser = {
        userId,
        tag,
        score: score.total,
        tokens: tokensClaimed.concat({
          code,
          value: scoreAcquired,
          claimedAt: dateString
        })
      }

      const userClaimSuccess = await updateDatabaseUser(updatedUser)
      if (!userClaimSuccess) {
        return parseResponseResult('error', 'Putz, deu ruim ao atualizar o usuário')
      }

      const databaseUpdatedToken = await updateDatabaseToken(updatedToken)
      if (!databaseUpdatedToken) {
        return parseResponseResult('error', 'Putz, deu ruim ao atualizar o token')
      }

      return parseResponseResult ('success', `O código ${code} foi resgatado por ${userId}.`)
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }
}
