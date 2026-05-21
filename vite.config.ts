import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/ecowealth_v2/api/appointments': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        rewrite: (path) => {
          if (path === '/ecowealth_v2/api/appointments' || path === '/ecowealth_v2/api/appointments/') {
            return '/ecowealth_v2/api/appointments/index.php'
          }
          return path
        },
      },
    },
  },
})
