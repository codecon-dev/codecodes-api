import { RequestResult } from "../types"

export function parseResponseResult(status: string, message: string): RequestResult {
  return { status, message }
}