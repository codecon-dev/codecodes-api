import { RequestResult } from "../types"

export function parseResponseResult(status: string, message: string, statusCode?: number): RequestResult {
  return { status, message, statusCode }
}