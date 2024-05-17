import { NonClaimedTokensRequestResult, RequestResult, Token } from "../types"
import { getTokenFromMongo, createOrUpdateToken, getTokensFromMongo, getUserFromMongo } from "./mongoose"

export async function getDatabaseTokenByCode (code: string): Promise<Token> {
  try {
    const token = await getTokenFromMongo(code)
    return token
  } catch (error) {
    console.log(error)
  }
}

export async function getDatabaseTokens (onlyNames?: boolean): Promise<Token[]> {
  try {
    const tokens = await getTokensFromMongo(onlyNames)
    return tokens
  } catch (error) {
    console.log(error)
  }
}

export async function crateDatabaseToken(token: Token): Promise<Token|false> {
  try {
    const tokenAlreadyExists = await getTokenFromMongo(token.code)

    if (tokenAlreadyExists) {
      return false
    }

    const newToken = {
      decreaseValue: 0,
      minimumValue: 0,
      totalClaims: Infinity,
      remainingClaims: token.totalClaims || Infinity,
      claimedBy: [],
      createdBy: 'API',
      createdAt: new Date().toISOString(),
      ...token
    }

    return updateDatabaseToken(newToken)
  } catch (error) {
    console.log(error)
    return false
  }
}

export async function updateDatabaseToken (token: Token): Promise<Token|false> {
  try {
    const { code } = token

    const updatedToken = await createOrUpdateToken(code, token)
    if (!updatedToken) {
      throw new Error(`Error on Token Update: Token ${code} was not found`)
    }
    return updatedToken
  } catch (error) {
    console.log(error)
    return false
  }
}

type validationResult = {
  valid: boolean,
  message?: string
}

export function validateTokenCode (code: string): validationResult {
  if (!/^[a-zA-Z0-9]+$/.test(code)) {
    return {
      valid: false,
      message: 'Còdigo não bateu com a regex /[a-zA-Z0-9]+/'
    }
  }

  return {
    valid: true
  }
}

export async function getNonClaimedTokensByUser(userId: string): Promise<NonClaimedTokensRequestResult|RequestResult> {
  try {
    const user = await getUserFromMongo(userId)
    if (!user) {
      return {
        status: 'error',
        message: 'User not found',
        statusCode: 404
      }
    }
    const userTokensCodes = user.tokens.map(token => token.code)
    const allTokens = await getDatabaseTokens()
    const nonClaimedTokens = allTokens.filter(databaseToken => {
      return !userTokensCodes.some(userTokenCode => databaseToken.code === userTokenCode)
    })

    return {
      status: 'success',
      message: `The user ${user.userId} has not claimed ${nonClaimedTokens.length} tokens`,
      data: nonClaimedTokens.map(token => `${token.code} - ${token.description}`)
    }
  } catch (error) {
    console.log(error)
  }
}