import { RankRequestResult } from "../types"
import { getDatabaseUsers } from "./user"

export default async function getRank(): Promise<RankRequestResult> {
  const users = await getDatabaseUsers()
  users.sort((a, b) => b.score - a.score)
  return {
    status: "sucess",
    message: `Rank for all ${users.length} users`,
    data: users
  }
}