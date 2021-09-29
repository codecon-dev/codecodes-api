import { GeneralStats, Token } from "../types"
import { getDatabaseTokens } from "./token"
import { getDatabaseUsers } from "./user"

function compactToken(token: Token) {
  return `${token.code} - "${token.description}" with ${token.claimedBy.length} claims`
}

export async function getStats(): Promise<GeneralStats> {
  try {
    const tokens = await getDatabaseTokens()
    const totalClaims = tokens.reduce((totalClaims, token) => token.claimedBy.length + totalClaims, 0)
    const tokensByClaimQuantityOrder = [...tokens].sort((a, b) => b.claimedBy.length - a.claimedBy.length)
    const compactTokensByClaimQuantityOrder = tokensByClaimQuantityOrder.map(compactToken)
    const users = await getDatabaseUsers()
    return {
      tokensQuantity: tokens.length,
      usersQuantity: users.length,
      totalClaims,
      tokensByClaimQuantity: compactTokensByClaimQuantityOrder,
    }
  } catch (error) {
    console.log(error)
  }
}