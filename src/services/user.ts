import { Token, User } from "../types"
import { getUserFromMongo, createOrUpdateUser, getUsersFromMongo } from "./mongoose"
import { getDatabaseTokens } from './token'

export async function getDatabaseUserById (userId: string): Promise<User> {
  try {
    const user = await getUserFromMongo(userId)
    if (!user) {
      throw new Error(`Error on getDatabaseUserById: User ${userId} was not found`)
    }

    return user
  } catch (error) {
    console.log(error)
  }
}
export async function updateDatabaseUser (user: User): Promise<User|false> {
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

export async function getDatabaseUsers (): Promise<User[]> {
  try {
    const users = await getUsersFromMongo()
    return users
  } catch (error) {
    console.log(error)
  }
}

export async function getNonClaimedTokensByUser(userId: string): Promise<string[]> {
  try {
    const user = await getUserFromMongo(userId)
    const userTokensCodes = user.tokens.map(token => token.code)
    const allTokens = await getDatabaseTokens()
    const nonClaimedTokens = allTokens.filter(databaseToken => {
      return !userTokensCodes.some(userTokenCode => databaseToken.code === userTokenCode)
    })
    return nonClaimedTokens.map(token => `${token.code} - ${token.description}`)
  } catch (error) {
    console.log(error)
  }
}