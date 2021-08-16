import { User } from "../types"
import { getUserFromMongo, createOrUpdateUser, getUsersFromMongo } from "./mongoose"

export async function getDatabaseUserById (userId: string): Promise<User> {
  try {
    const user = await getUserFromMongo(userId)
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