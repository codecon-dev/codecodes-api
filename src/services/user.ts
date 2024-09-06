import { DateTime } from 'luxon'
import { SoftDeleteResult, User } from '../types'
import {
  createOrUpdateUser,
  getUserFromMongo,
  getUsersFromMongo,
  softDeleteUser
} from './mongoose'

export async function getDatabaseUserById(userId: string): Promise<User> {
  try {
    const user = await getUserFromMongo(userId)
    if (!user) {
      throw new Error(
        `Error on getDatabaseUserById: User ${userId} was not found`
      )
    }

    return user
  } catch (error) {
    console.log(error)
  }
}
export async function updateDatabaseUser(user: User): Promise<User | false> {
  try {
    const { userId } = user

    const updatedUser = await createOrUpdateUser(userId, user)
    if (!updatedUser) {
      throw new Error(`Error on User Update: User ${userId} was not found`)
    }
    return updatedUser
  } catch (error) {
    console.log(error)
    return false
  }
}

export async function getDatabaseUsers(): Promise<User[]> {
  try {
    const users = await getUsersFromMongo({ softDeleted: { $ne: true } })
    return users
  } catch (error) {
    console.log(error)
  }
}

export async function checkForSuspiciousActivity(): Promise<any[]> {
  try {
    const users = await getUsersFromMongo({ softDeleted: { $ne: true } })
    const suspiciousUsers = users.filter(user => {
      if (user.tokens.length < 10) return false

      const sortedTokens = user.tokens.sort((a, b) =>
        DateTime.fromISO(b.claimedAt).toMillis() - DateTime.fromISO(a.claimedAt).toMillis()
      )

      let consecutiveQuickClaims = 0
      let suspiciousTokens = []
      for (let i = 1; i < sortedTokens.length; i++) {
        const timeDiff = DateTime.fromISO(sortedTokens[i - 1].claimedAt).diff(
          DateTime.fromISO(sortedTokens[i].claimedAt), 'seconds'
        ).seconds

        if (timeDiff < 5) {
          consecutiveQuickClaims++
          suspiciousTokens.push(sortedTokens[i])
          if (consecutiveQuickClaims >= 9) {
            suspiciousTokens.push(sortedTokens[i - 1]) // Add the 10th token
            return true
          }
        } else {
          consecutiveQuickClaims = 0
          suspiciousTokens = []
        }
      }

      return false
    }).map(user => ({
      userId: user.userId,
      score: user.score,
      suspiciousTokens: user.tokens
        .sort((a, b) => DateTime.fromISO(b.claimedAt).toMillis() - DateTime.fromISO(a.claimedAt).toMillis())
        .slice(0, 10)
        .map(token => ({
          code: token.code,
          claimedAt: token.claimedAt
        }))
    }))

    return suspiciousUsers
  } catch (error) {
    console.log(error)
    return []
  }
}

export async function softDeleteUserById(userId: string): Promise<SoftDeleteResult> {
  try {
    const user = await softDeleteUser(userId)
    if (!user) {
      return { success: false, message: `User ${userId} not found` }
    }
    return { success: true, message: `User ${userId} has been soft deleted`, user }
  } catch (error) {
    console.log(`Error soft deleting user ${userId}:`, error)
    return { success: false, message: 'An error occurred while soft deleting the user' }
  }
}
