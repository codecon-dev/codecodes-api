import { Token } from "../types"
import { getTokenFromMongo, createOrUpdateToken } from "./mongoose"

export async function getDatabaseTokenByCode (code: string): Promise<Token> {
  try {
    const token = await getTokenFromMongo(code)
    return token
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