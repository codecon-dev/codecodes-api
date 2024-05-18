import { getDatabaseTokenByCode, updateDatabaseToken } from './token'
import { getDatabaseUserById, updateDatabaseUser } from './user'
import { parseResponseResult } from '../common/parseResponseResult'
import config from '../config'
import { UserClaim, RequestResult, Token, ClaimRequestResult } from '../types'
import { DateTime } from 'luxon'

function isExpired(expireAt: string) {
  const now = DateTime.now().setZone('America/Sao_Paulo')
  const expirationDate = DateTime.fromISO(expireAt, { zone: 'America/Sao_Paulo' })
  return expireAt && now > expirationDate
}

function hasUserAlreadyClaimed(claimedBy: UserClaim[], userId: string) {
  return claimedBy.some(claimedUser => claimedUser.id === userId)
}

function computeScore(claimedBy: UserClaim[], value: number, decreaseValue: number, minimumValue: number) {
  const timesClaimed = claimedBy.length
  let scoreAcquired = value - (timesClaimed * decreaseValue)
  if (scoreAcquired < minimumValue) {
    scoreAcquired = minimumValue
  }
  return scoreAcquired
}

async function saveUserScore(userId: string, scoreAcquired: number, tag: string, code: string, nowDateString: string) {
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

  const updatedUser = {
    userId,
    tag,
    score: score.total,
    tokens: tokensClaimed.concat({
      code,
      value: scoreAcquired,
      claimedAt: nowDateString
    })
  }

  return updateDatabaseUser(updatedUser)
}

async function saveTokenClaims(userTag: string, userId: string, nowDateString: string, token: Token) {
  const claimUser = {
    tag: userTag,
    id: String(userId),
    claimedAt: nowDateString
  }

  const updatedToken = {
    ...token,
    remainingClaims: token.remainingClaims - 1,
    claimedBy: token.claimedBy.concat(claimUser)
  }

  return updateDatabaseToken(updatedToken)
}

export default async function claimService(code: string, userId: string, tag: string): Promise<RequestResult | ClaimRequestResult> {
  try {
    console.log(`[CLAIM-SERVICE] User ${userId} (${tag}) is trying to claim ${code}`)

    if (!config.claim.enabled) {
      return parseResponseResult('error', config.claim.disabledMessage, 422)
    }

    if (!code) {
      return parseResponseResult('error', 'Nenhum código foi fornecido', 422)
    }

    const token = await getDatabaseTokenByCode(code)
    if (!token) {
      return parseResponseResult('error', 'Código não encontrado', 422)
    }

    const { claimedBy, remainingClaims, value, decreaseValue, minimumValue, expireAt } = token

    if (!remainingClaims) {
      return parseResponseResult('error', 'Vish, acabaram os resgates disponíveis para esse token :(', 422)
    }

    if (isExpired(expireAt)) {
      return parseResponseResult('error', 'Esse token expirou :(', 422)
    }

    if (hasUserAlreadyClaimed(claimedBy, userId)) {
      return parseResponseResult('error', 'Você já resgatou esse token 👀', 422)
    }

    const date = new Date(Date.now())
    const nowDateString = date.toISOString()

    const scoreAcquired = computeScore(claimedBy, value, decreaseValue, minimumValue)

    const userClaimSuccess = await saveUserScore(userId, scoreAcquired, tag, code, nowDateString)
    if (!userClaimSuccess) {
      return parseResponseResult('error', 'Putz, deu ruim ao atualizar o usuário. Entre em contato com um administrador.', 422)
    }

    const databaseUpdatedToken = await saveTokenClaims(tag, userId, nowDateString, token)
    if (databaseUpdatedToken.status === 'error') {
      return parseResponseResult('error', 'Putz, deu ruim ao atualizar o token. Entre em contato com um administrador.', 422)
    }

    return {
      status: 'success',
      message: `Boa! Você ganhou ${scoreAcquired} pontos e agora está com ${userClaimSuccess.score} pontos!`,
      statusCode: 200,
      data: {
        scoreAcquired,
        totalScore: userClaimSuccess.score
      }
    }
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}