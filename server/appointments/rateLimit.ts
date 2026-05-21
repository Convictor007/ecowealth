import { getRateLimitPerHour, getRateWindowMs } from './security'

/** Per-instance memory store (best-effort on serverless; no database required). */
const hitsByIp = new Map<string, number[]>()

function prune(timestamps: number[], since: number): number[] {
  return timestamps.filter((t) => t > since)
}

export function checkRateLimit(ipHash: string): boolean {
  const since = Date.now() - getRateWindowMs()
  const limit = getRateLimitPerHour()
  const existing = hitsByIp.get(ipHash) ?? []
  const recent = prune(existing, since)
  hitsByIp.set(ipHash, recent)
  return recent.length < limit
}

export function recordRateLimit(ipHash: string): void {
  const since = Date.now() - getRateWindowMs()
  const existing = hitsByIp.get(ipHash) ?? []
  const recent = prune(existing, since)
  recent.push(Date.now())
  hitsByIp.set(ipHash, recent)
}
