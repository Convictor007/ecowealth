const VITE_DEV_PORTS = new Set(['5173', '5174', '4173'])

/** MySQL-backed PHP API (XAMPP) */
export function resolvePhpApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE as string | undefined
  if (fromEnv?.trim()) {
    return fromEnv.trim().replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const { pathname, origin } = window.location
    if (pathname.includes('/ecowealth_v2')) {
      return `${origin}/ecowealth_v2/api/v1`
    }
  }

  if (import.meta.env.DEV) {
    return '/api/v1'
  }

  return ''
}

export function useMysqlApi(): boolean {
  if (import.meta.env.VITE_USE_MYSQL_API === 'true') return true
  return resolvePhpApiBase() !== ''
}

export function isViteDevServer(): boolean {
  if (typeof window === 'undefined') return false
  return VITE_DEV_PORTS.has(window.location.port)
}
