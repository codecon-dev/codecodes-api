import { GeneralStats, Token } from "../types"
import { getLatestClaimedTokens, getClaimsPerHour } from "./mongoose"
import { getDatabaseTokens } from "./token"
import { getDatabaseUsers } from "./user"

function compactToken(token: Token) {
  return `${token.code} - ${token.claimedBy.length} claims`
}

export async function getStats(): Promise<GeneralStats> {
  try {
    const tokens = await getDatabaseTokens()
    const totalClaims = tokens.reduce((totalClaims, token) => token.claimedBy.length + totalClaims, 0)
    const tokensByClaimQuantityOrder = [...tokens].sort((a, b) => b.claimedBy.length - a.claimedBy.length)
    const compactTokensByClaimQuantityOrder = tokensByClaimQuantityOrder.map(compactToken)
    const tokensWithNoClaims = tokens.filter(token => token.claimedBy.length === 0)
    const tokensWithClaims = tokens.filter(token => token.claimedBy.length > 0)
    const latestClaimedTokens = await getLatestClaimedTokens()
    const claimsPerDate = await getClaimsPerHour()

    const users = await getDatabaseUsers()
    return {
      tokensQuantity: tokens.length,
      usersQuantity: users.length,
      totalClaims,
      tokensByClaimQuantity: compactTokensByClaimQuantityOrder,
      tokensWithClaims: tokensWithClaims.length,
      tokensWithNoClaims: tokensWithNoClaims.length,
      latestClaimedTokens,
      claimsPerDate
    }
  } catch (error) {
    console.log(error)
  }
}