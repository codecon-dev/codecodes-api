import { NextFunction, Request, Response } from 'express'
import { getDatabaseTokenByCode, updateDatabaseToken } from '../services/token'
import { getDatabaseUserById, updateDatabaseUser } from '../services/user'
import config from '../config'

export async function claim (request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    if (!config.claim.enabled) {
      response.json({
        status: 'error',
        message: config.claim.disabledMessage
      })
      return
    }

    const { body: { code, email: userId, name: tag } } = request

    if (!code) {
      response.json({
        status: 'error',
        message: 'No code was provided'
      })
      return
    }

    const token = await getDatabaseTokenByCode(code)

    const { claimedBy, remainingClaims, value, decreaseValue, minimumValue, expireAt } = token

    if (!remainingClaims) {
      response.json({
        status: 'error',
        message: 'Vish, acabaram os resgates disponíveis para esse token :('
      })
      return
    }

    const isExpired = expireAt && new Date(Date.now()) > new Date(expireAt)
    if (isExpired) {
      response.json({
        status: 'error',
        message: 'Esse token expirou :('
      })
      return
    }

    const hasAlreadyClaimed = claimedBy.some(claimedUser => claimedUser.id === userId)
    if (hasAlreadyClaimed) {
      response.json({
        status: 'error',
        message: 'Você já resgatou esse token :eyes:'
      })
      return
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
      response.json({
        status: 'error',
        message: 'Putz, deu ruim ao atualizar o usuário'
      })
      return
    }

    const databaseUpdatedToken = await updateDatabaseToken(updatedToken)
    if (!databaseUpdatedToken) {
      response.json({
        status: 'error',
        message: 'Putz, deu ruim ao atualizar o token'
      })
      return
    }

    response.json({
      status: 'success',
      message: `O código ${code} foi resgatado por ${userId}.`
    })
    return
  } catch (error) {
    next(error)
    console.log(error)
  }
}

export default {
  claim
}