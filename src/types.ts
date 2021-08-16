export type UserClaim = {
  tag: string
  id: string
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

export type User = {
  userId: string
  tag: string
  score: number
  tokens: Token[]
}

export type RequestResult = {
  status: string,
  message: string
}

export interface ITokenClaimPayload {
  code: string;
  email: string;
  name: string;
}

export interface ErrorResponseModel {
  status: number;
  message: string;
}