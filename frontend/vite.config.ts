import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const disableHmr = process.env.VITE_DISABLE_HMR === '1'
  const frontendPort = parseInt(process.env.FRONTEND_PORT || '5174')

  return {
    plugins: [react()],
    server: {
      host: true,
      port: frontendPort,
      hmr: disableHmr
        ? false
        : {
            clientPort: frontendPort,
          },
      watch: {
        usePolling: true,
      },
    },
  }
})
