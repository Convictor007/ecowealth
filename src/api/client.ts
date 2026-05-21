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

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new ApiError(`Request failed: ${path}`, response.status)
  }
  return response.json() as Promise<T>
}

function parseJsonBody<T>(text: string): T | null {
  if (!text.trim()) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
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
      'Cannot reach the booking server. Start Apache (XAMPP) or run vercel dev, then try again.',
      0,
    )
  }

  const text = await response.text()
  const data = parseJsonBody<T & { message?: string; success?: boolean }>(text)

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : `Request failed (${response.status}).`
    throw new ApiError(message, response.status, data ?? undefined)
  }

  if (data === null) {
    throw new ApiError('Invalid response from booking server.', response.status)
  }

  return data as T
}
