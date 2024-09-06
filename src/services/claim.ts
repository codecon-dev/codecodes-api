import { DateTime } from 'luxon'
import { parseResponseResult } from '../common/parseResponseResult'
import config from '../config'
import { ClaimRequestResult, RequestResult, Token, UserClaim } from '../types'
import { getDatabaseTokenByCode, updateDatabaseToken } from './token'
import { getDatabaseUserById, updateDatabaseUser } from './user'

function isExpired(expireAt: string) {
  const now = DateTime.now().setZone('America/Sao_Paulo')
  const expirationDate = DateTime.fromISO(expireAt, {
    zone: 'America/Sao_Paulo'
  })
  return expireAt && now > expirationDate
}

function hasUserAlreadyClaimed(claimedBy: UserClaim[], userId: string) {
  return claimedBy.some((claimedUser) => claimedUser.id === userId)
}

function computeScore(
  claimedBy: UserClaim[],
  value: number,
  decreaseValue: number,
  minimumValue: number
) {
  const timesClaimed = claimedBy.length
  let scoreAcquired = value - timesClaimed * decreaseValue
  if (scoreAcquired < minimumValue) {
    scoreAcquired = minimumValue
  }
  return scoreAcquired
}

async function saveUserScore(
  userId: string,
  scoreAcquired: number,
  tag: string,
  code: string,
  nowDateString: string
) {
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

async function saveTokenClaims(
  userTag: string,
  userId: string,
  nowDateString: string,
  token: Token
) {
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

export default async function claimService(
  code: string,
  userId: string,
  tag: string
): Promise<RequestResult | ClaimRequestResult> {
  try {
    console.log(`[CLAIM-SERVICE] User ${userId} (${tag}) is trying to claim ${code}`)

    console.log('[CLAIM-SERVICE] Checking if claim is enabled')
    if (!config.claim.enabled) {
      console.log('[CLAIM-SERVICE] Claim is disabled')
      return parseResponseResult('error', config.claim.disabledMessage, 422)
    }

    console.log('[CLAIM-SERVICE] Checking if code is provided')
    if (!code) {
      console.log('[CLAIM-SERVICE] No code provided')
      return parseResponseResult('error', 'Nenhum código foi fornecido', 422)
    }

    console.log('[CLAIM-SERVICE] Getting token from database')
    const token = await getDatabaseTokenByCode(code)
    if (!token) {
      console.log('[CLAIM-SERVICE] Token not found')
      return parseResponseResult('error', 'Código não encontrado', 422)
    }

    const {
      claimedBy,
      remainingClaims,
      value,
      decreaseValue,
      minimumValue,
      expireAt
    } = token

    console.log('[CLAIM-SERVICE] Checking if remaining claims are available')
    if (!remainingClaims) {
      console.log('[CLAIM-SERVICE] No remaining claims available')
      return parseResponseResult(
        'error',
        'Vish, acabaram os resgates disponíveis para esse token :(',
        422
      )
    }

    console.log('[CLAIM-SERVICE] Checking if token is expired')
    if (isExpired(expireAt)) {
      console.log('[CLAIM-SERVICE] Token is expired')
      return parseResponseResult('error', 'Esse token expirou :(', 422)
    }

    console.log('[CLAIM-SERVICE] Checking if user has already claimed the token')
    if (hasUserAlreadyClaimed(claimedBy, userId)) {
      console.log('[CLAIM-SERVICE] User has already claimed the token')
      return parseResponseResult('error', 'Você já resgatou esse token 👀', 422)
    }

    const date = new Date(Date.now())
    const nowDateString = date.toISOString()
    console.log('[CLAIM-SERVICE] Computing score')
    const scoreAcquired = computeScore(
      claimedBy,
      value,
      decreaseValue,
      minimumValue
    )

    console.log('[CLAIM-SERVICE] Saving user score')
    const userClaimSuccess = await saveUserScore(
      userId,
      scoreAcquired,
      tag,
      code,
      nowDateString
    )
    if (!userClaimSuccess) {
      console.log('[CLAIM-SERVICE] Failed to update user score')
      return parseResponseResult(
        'error',
        'Putz, deu ruim ao atualizar o usuário. Entre em contato com um administrador.',
        422
      )
    }

    console.log('[CLAIM-SERVICE] Saving token claims')
    const databaseUpdatedToken = await saveTokenClaims(
      tag,
      userId,
      nowDateString,
      token
    )
    if (databaseUpdatedToken.status === 'error') {
      console.log('[CLAIM-SERVICE] Failed to update token claims')
      return parseResponseResult(
        'error',
        'Putz, deu ruim ao atualizar o token. Entre em contato com um administrador.',
        422
      )
    }

    console.log('[CLAIM-SERVICE] Claim process completed successfully')
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
    console.log('[CLAIM-SERVICE] Error occurred:', error)
    throw new Error(error)
  }
}
