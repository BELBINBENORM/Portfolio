import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // ignore large or locked media files to avoid EBUSY watcher errors
      ignored: [
        '**/Photo - 15-04-2026.jpg',
        '**/BELBIN RESUME - AIML.pdf',
        '**/public/videos/**',
        '**/public/**/ai-ambient.mp4'
      ]
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
});
