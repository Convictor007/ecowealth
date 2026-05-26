import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect } from 'vite'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const APPOINTMENTS_PATH = '/api/appointments'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function toVercelRequest(req: IncomingMessage, bodyText: string): VercelRequest {
  const url = new URL(req.url ?? APPOINTMENTS_PATH, 'http://localhost')
  let body: unknown = undefined
  if (bodyText.trim()) {
    try {
      body = JSON.parse(bodyText) as unknown
    } catch {
      body = bodyText
    }
  }
  return {
    method: req.method,
    headers: req.headers,
    body,
    query: Object.fromEntries(url.searchParams.entries()),
    socket: req.socket,
  } as VercelRequest
}

function toVercelResponse(res: ServerResponse): VercelResponse {
  const vercelRes = {
    statusCode: 200,
    headersSent: false,
    status(code: number) {
      res.statusCode = code
      return vercelRes
    },
    setHeader(name: string, value: string | number) {
      res.setHeader(name, value)
      return vercelRes
    },
    json(payload: unknown) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      }
      res.end(JSON.stringify(payload))
      return vercelRes
    },
    end(data?: string) {
      res.end(data)
      return vercelRes
    },
  }
  Object.defineProperty(vercelRes, 'headersSent', {
    get: () => res.headersSent,
  })
  return vercelRes as VercelResponse
}

async function handleAppointments(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
) {
  const pathname = req.url?.split('?')[0]
  if (pathname !== APPOINTMENTS_PATH) {
    return next()
  }

  try {
    const bodyText =
      req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH'
        ? await readBody(req)
        : ''

    const handler = (await import('./api/appointments/index.ts')).default
    const vercelReq = toVercelRequest(req, bodyText)
    const vercelRes = toVercelResponse(res)
    await handler(vercelReq, vercelRes)
  } catch (err) {
    console.error('[appointments-dev]', err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(
        JSON.stringify({
          success: false,
          message: 'Booking API error in dev server.',
          detail: err instanceof Error ? err.message : String(err),
        }),
      )
    }
  }
}

function attachMiddleware(server: ViteDevServer | PreviewServer) {
  server.middlewares.use(handleAppointments)
}

/** Serves POST/GET /api/appointments during `vite` and `vite preview` (no XAMPP required). */
export function appointmentsDevApi(): Plugin {
  return {
    name: 'ecowealth-appointments-dev-api',
    configureServer(server) {
      attachMiddleware(server)
    },
    configurePreviewServer(server) {
      attachMiddleware(server)
    },
  }
}
