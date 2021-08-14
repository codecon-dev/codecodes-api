import { User } from "../types"
import { getUserFromMongo, createOrUpdateUser } from "./mongoose"

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