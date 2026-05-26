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

  return {
    plugins: [react(), appointmentsDevApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // Optional: still proxy to XAMPP if VITE_APPOINTMENT_API_URL points at PHP
      proxy: env.VITE_APPOINTMENT_PROXY_TARGET
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
