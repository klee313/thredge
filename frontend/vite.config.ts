import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'FRONTEND_'])
  const disableHmr = env.VITE_DISABLE_HMR === '1'
  const portValue = Number(env.FRONTEND_PORT ?? 5174)
  const frontendPort = Number.isFinite(portValue) ? portValue : 5174
  const usePolling = env.VITE_USE_POLLING === '1'
  const allowedHosts = (env.VITE_ALLOWED_HOSTS || 'idealog.pe.kr')
    .split(',')
    .map((host) => host.trim())
    .filter((host) => host.length > 0)

  return {
    plugins: [react()],
    server: {
      host: true,
      allowedHosts,
      port: frontendPort,
      hmr: disableHmr
        ? false
        : {
            clientPort: frontendPort,
          },
      watch: {
        usePolling,
      },
    },
  }
})
