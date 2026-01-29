import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Try to load HTTPS certificates, fallback to HTTP if not available
let httpsConfig = undefined
try {
  httpsConfig = {
    key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
  }
  console.log('✅ HTTPS certificates loaded successfully')
} catch (error) {
  console.warn('⚠️  HTTPS certificates not found, running in HTTP mode')
  console.warn('   To enable HTTPS, ensure ssl/cert.pem and ssl/key.pem exist')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Use IPv4 localhost for better compatibility
    port: 5173,
    strictPort: true,
    https: httpsConfig,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
})
