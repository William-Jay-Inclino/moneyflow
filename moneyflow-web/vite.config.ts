import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        vue(), 
        tailwindcss()
    ],
    server: {
        port: 9001,
        host: true
    }
})
