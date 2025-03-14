export type UserClaim = {
  tag: string
  id: string
  claimedAt: string
}

export type UserClaimedToken = {
  code: string
  value: number
  claimedAt: string
}

export type Token = {
  code: string
  description: string
  value: number
  decreaseValue?: number
  minimumValue?: number
  totalClaims?: number
  remainingClaims?: number
  claimedBy?: UserClaim[]
  createdBy?: string
  createdAt?: string
  expireAt?: string
}

export type GeneralStats = {
  tokensQuantity: number
  totalClaims: number
  usersQuantity: number
  tokensByClaimQuantity: { code: string; claims: number }[]
  tokensWithClaims: number
  tokensWithNoClaims: number
  latestClaimedTokens: Token[]
  claimsPerDate: { date: string; count: number }[]
}

export type User = {
  userId: string
  tag: string
  score: number
  tokens: UserClaimedToken[]
  softDeleted?: boolean
}

export type CompactUser = {
  userId: string
  score: number
  tag: string
  claims?: number
  softDeleted?: boolean
}

export type ClaimRequestResult = {
  status: string
  message: string
  statusCode: 200
  data: {
    scoreAcquired: number
    totalScore: number
  }
}

export type RequestResult = {
  status: string
  message: string
  statusCode?: number
  data?: unknown
}

export type RankRequestResult = {
  status: string
  message: string
  statusCode: 200
  data: RankWithUser
}

type RankWithUser = {
  ranking: CompactUser[]
  currentUserPosition: number
  currentUserScore: number
}

export type StatsRequestResult = {
  status: string
  message: string
  statusCode: 200
  data: GeneralStats
}

export type NonClaimedTokensRequestResult = {
  status: string
  message: string
  statusCode: 200
  data: string[]
}

export interface ITokenClaimPayload {
  code: string
  email: string
  name: string
}

export interface ITokenPayload {
  code: string
  description: string
  value: number
  totalClaims?: number
  decreaseValue?: number
  minimumValue?: number
  expireAt?: string
}

export interface ErrorResponseModel {
  statusCode: number
  message: string
}

// Add a new interface for soft delete operations
export interface SoftDeleteResult {
  success: boolean
  message: string
  user?: User
}

export interface UserResponse {
  success: boolean
  message: string
  statusCode?: number
  user?: User
}
