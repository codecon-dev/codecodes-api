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
  decreaseValue: number
  minimumValue: number
  totalClaims: number
  remainingClaims: number
  claimedBy: UserClaim[]
  createdBy: string
  createdAt: string
  expireAt: string
}

export type GeneralStats = {
  tokensQuantity: number,
  totalClaims: number,
  usersQuantity: number,
  tokensByClaimQuantity: string[]
}

export type User = {
  userId: string
  tag: string
  score: number
  tokens: UserClaimedToken[]
}

export type CompactUser = {
  userId: string,
  score: number,
  tag: string,
  claims: number
}

export type ClaimRequestResult = {
  status: string,
  message: string,
  statusCode: 200,
  data: {
    scoreAcquired: number,
    totalScore: number
  }
}

export type RequestResult = {
  status: string,
  message: string,
  statusCode?: number,
}

export type RankRequestResult = {
  status: string,
  message: string,
  statusCode: 200,
  data: CompactUser[]
}

export type StatsRequestResult = {
  status: string,
  message: string,
  statusCode: 200,
  data: GeneralStats
}

export interface ITokenClaimPayload {
  code: string;
  email: string;
  name: string;
}

export interface ErrorResponseModel {
  statusCode: number;
  message: string;
}
