import { readAndMapCsvTokens } from "../common/files"
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

export async function importToken (file): Promise<void> {
  try {
    const tokens = await readAndMapCsvTokens(file)

    const failedTokens = []
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index]
      const success = await createDatabaseToken(token)
      if (!success) {
        failedTokens.push(token.code)
        console.log(`Token ${token.code} deu ruim =/`)
        continue
      }
      console.log(`Token ${token.code} criado!`)
    }

    await removeOrUpdateReaction(awaitReaction, true)
    return message.channel.send(`Dos ${tokens.length} tokens, ${failedTokens.length} deram ruim: ${failedTokens.join(', ')}`)
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}