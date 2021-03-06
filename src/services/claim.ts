import { getDatabaseTokenByCode, updateDatabaseToken } from './token'
import { getDatabaseUserById, updateDatabaseUser } from './user'
import { parseResponseResult } from '../common/parseResponseResult'
import config from '../config'
import { UserClaim, RequestResult, Token, ClaimRequestResult } from '../types'

function isExpired(expireAt: string) {
  return expireAt && new Date(Date.now()) > new Date(expireAt)
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

export default async function claimService(code: string, userId: string, tag: string): Promise<RequestResult|ClaimRequestResult> {
  try {
    if (!config.claim.enabled) {
      return parseResponseResult('error', config.claim.disabledMessage, 422)
    }

    if (!code) {
      return parseResponseResult('error', 'Nenhum c??digo foi fornecido', 422)
    }

    const token = await getDatabaseTokenByCode(code)
    if (!token) {
      return parseResponseResult('error', 'C??digo n??o encontrado', 422)
    }

    const { claimedBy, remainingClaims, value, decreaseValue, minimumValue, expireAt } = token

    if (!remainingClaims) {
      return parseResponseResult('error', 'Vish, acabaram os resgates dispon??veis para esse token :(', 422)
    }

    if (isExpired(expireAt)) {
      return parseResponseResult('error', 'Esse token expirou :(', 422)
    }

    if (hasUserAlreadyClaimed(claimedBy, userId)) {
      return parseResponseResult('error', 'Voc?? j?? resgatou esse token ????', 422)
    }

    const date = new Date(Date.now())
    const nowDateString = date.toISOString()

    const scoreAcquired = computeScore(claimedBy, value, decreaseValue, minimumValue)

    const userClaimSuccess = await saveUserScore(userId, scoreAcquired, tag, code, nowDateString)
    if (!userClaimSuccess) {
      return parseResponseResult('error', 'Putz, deu ruim ao atualizar o usu??rio. Entre em contato com um administrador.', 422)
    }

    const databaseUpdatedToken = await saveTokenClaims(tag, userId, nowDateString, token)
    if (!databaseUpdatedToken) {
      return parseResponseResult('error', 'Putz, deu ruim ao atualizar o token. Entre em contato com um administrador.', 422)
    }
    return {
      status: 'success',
      message: `Boa! Voc?? ganhou ${scoreAcquired} pontos e agora est?? com ${userClaimSuccess.score} pontos!`,
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