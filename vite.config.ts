import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { appointmentsDevApi } from './vite-plugin-appointments-dev'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  const xamppOrigin = env.VITE_XAMPP_ORIGIN || 'http://localhost'
  const useMysqlProxy = env.VITE_USE_MYSQL_API === 'true'

  return {
    plugins: [react(), appointmentsDevApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: useMysqlProxy
        ? {
            '/api/v1': {
              target: xamppOrigin,
              changeOrigin: true,
              rewrite: (p) => {
                const name = p.replace(/^\/api\/v1\/?/, '') || 'index'
                return `/ecowealth_v2/api/v1/${name}.php`
              },
            },
            ...(env.VITE_APPOINTMENT_PROXY_TARGET
              ? {
                  '/api/appointments': {
                    target: env.VITE_APPOINTMENT_PROXY_TARGET,
                    changeOrigin: true,
                    rewrite: () => '/ecowealth_v2/api/appointments/book.php',
                  },
                }
              : {}),
          }
        : env.VITE_APPOINTMENT_PROXY_TARGET
          ? {
              '/api/appointments': {
                target: env.VITE_APPOINTMENT_PROXY_TARGET,
                changeOrigin: true,
                rewrite: () => '/ecowealth_v2/api/appointments/book.php',
              },
            }
          : undefined,
    },
  }
})
