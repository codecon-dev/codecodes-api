import { RankRequestResult, User, UserClaimedToken } from '../types'

function getLastClaimedToken(user: User) {
  return user.tokens[user.tokens.length - 1]
}

function getUserClaimDate(token: UserClaimedToken) {
  return new Date(token.claimedAt)
}

function getAndSubtractUsersLastClaimDates(previousUser: User, nextUser: User) {
  const previousLastClaimedToken = getLastClaimedToken(previousUser)
  const nextLastClaimedToken = getLastClaimedToken(nextUser)
  const previousLastClaimedTokenDate = getUserClaimDate(
    previousLastClaimedToken
  )
  const nextLastClaimedTokenDate = getUserClaimDate(nextLastClaimedToken)
  return Number(nextLastClaimedTokenDate) - Number(previousLastClaimedTokenDate)
}

function sortUsers(users: User[]) {
  return users.sort((previousUser, nextUser) => {
    const hasSameScore = nextUser.score === previousUser.score
    if (!hasSameScore) return nextUser.score - previousUser.score

    const hasSameClaimsNumber =
      nextUser.tokens.length === previousUser.tokens.length
    if (!hasSameClaimsNumber)
      return nextUser.tokens.length - previousUser.tokens.length

    return getAndSubtractUsersLastClaimDates(nextUser, previousUser)
  })
}

function mapCompactUsers(users: User[]) {
  return users.map(({ userId, score, tag, tokens }) => ({
    userId,
    score,
    tag,
    // claims: tokens.length
  }))
}

export async function getRankService(
  users: User[]
): Promise<RankRequestResult> {
  const isRankEnabled = true
  if (!isRankEnabled) {
    return {
      status: 'sucess',
      statusCode: 200,
      message: 'Rank is disabled',
      data: []
    }
  }

  const usersSorted = sortUsers(users)
  const compactUsers = mapCompactUsers(usersSorted)
  return {
    status: 'sucess',
    statusCode: 200,
    message: `Rank for all ${users.length} users`,
    data: compactUsers
  }
}
