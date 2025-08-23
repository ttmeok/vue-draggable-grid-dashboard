import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vue-draggable-grid-dashboard/',
  plugins: [vue()],
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: 'index.html'
    }
  }
})
