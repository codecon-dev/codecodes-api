import { readAndMapCsvTokens } from "../common/files"
import { MulterRequest } from "../controllers/token"
import { ITokenPayload, NonClaimedTokensRequestResult, RequestResult, Token } from "../types"
import { getTokenFromMongo, updateToken, getTokensFromMongo, getUserFromMongo, createToken } from "./mongoose"

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

export async function createDatabaseToken(tokenData: Token): Promise<RequestResult> {
  try {
    const tokenAlreadyExists = await getTokenFromMongo(tokenData.code)

    if (tokenAlreadyExists) {
      return {
        status: "error",
        message: "Este token já existe!",
        statusCode: 409
      }
    }

    const token = await createToken({
      decreaseValue: 0,
      minimumValue: 0,
      totalClaims: Infinity,
      remainingClaims: tokenData.totalClaims || Infinity,
      claimedBy: [],
      createdBy: 'API',
      createdAt: new Date().toISOString(),
      ...tokenData
    })

    return {
      status: "success",
      message: "Token criado com sucesso",
      statusCode: 200,
      data: token
    }

  } catch (error) {
    console.log(error)
    return {
      status: "error",
      message: error,
      statusCode: 500
    }
  }
}

export async function updateDatabaseToken(token: Token, tokenId?: string): Promise<RequestResult> {
  try {
    const code = tokenId || token.code

    const updatedToken = await updateToken(code, token)
    if (!updatedToken) {
      return {
        status: "error",
        message: "Token não encontrado",
        statusCode: 404
      }
    }

    return {
      status: "success",
      message: "Token atualizado com sucesso",
      statusCode: 200,
      data: updatedToken
    }
  } catch (error) {
    console.log(error)
    return {
      status: "error",
      message: error,
      statusCode: 500
    }
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

export async function batchCreate(tokens: ITokenPayload[]): Promise<RequestResult> {
  const failedTokens = []
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    const tokenRequest = await createDatabaseToken(token)
    if (tokenRequest.status !== 'success') {
      failedTokens.push(token.code)
      console.log(`Token ${token.code} deu ruim =/`)
      continue
    }
    console.log(`Token ${token.code} criado!`)
  }

  if (failedTokens.length === tokens.length) {
    return {
      status: 'error',
      message: "Todos os tokens falharam",
      statusCode: 409
    }
  }

  return {
    status: 'success',
    message: `Processado com sucesso. Dos ${tokens.length} tokens, ${failedTokens.length} deram ruim: ${failedTokens.join(', ')}`,
    statusCode: 200
  }
}

export async function importTokens(request: MulterRequest): Promise<RequestResult> {
  try {
    const tokens = await readAndMapCsvTokens(request.file.path)

    const importResult = await batchCreate(tokens)

    return importResult
  } catch (error) {
    return {
      status: 'error',
      message: "Ops! Algo deu errado.",
      statusCode: 500
    }
  }
}