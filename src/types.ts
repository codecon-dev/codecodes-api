
type UserClaim = {
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