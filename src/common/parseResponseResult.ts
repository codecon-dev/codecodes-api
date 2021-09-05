import { RequestResult } from "../types"

export function parseResponseResult(status: string, message: string, code?: number): RequestResult {
  return { status, message, code }
}