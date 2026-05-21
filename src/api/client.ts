export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function parseJsonBody<T>(text: string): T | null {
  if (!text.trim()) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message
    }
    const nested = record.error
    if (nested && typeof nested === 'object') {
      const errMsg = (nested as { message?: unknown }).message
      if (typeof errMsg === 'string' && errMsg.trim()) return errMsg
    }
  }
  if (status === 500) {
    return 'Booking server error. Please try again or call the clinic.'
  }
  return `Request failed (${status}).`
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path)
  const text = await response.text()
  const data = parseJsonBody<T>(text)

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data, response.status), response.status, data ?? undefined)
  }
  if (data === null) {
    throw new ApiError(`Request failed: ${path}`, response.status)
  }
  return data
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-EcoWealth-Booking': '1',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      'Cannot reach the booking server. Check your connection or call the clinic.',
      0,
    )
  }

  const text = await response.text()
  const data = parseJsonBody<T & { message?: string; success?: boolean }>(text)

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data, response.status), response.status, data ?? undefined)
  }

  if (data === null) {
    throw new ApiError('Invalid response from booking server.', response.status)
  }

  return data as T
}
