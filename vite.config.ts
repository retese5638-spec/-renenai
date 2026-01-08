import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages'de "/her-eyi-ret-yapay-zekaya/" alt klasöründe çalışacağı için
  // base path'i buna göre ayarlıyoruz.
  base: '/her-eyi-ret-yapay-zekaya/', 
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
  }
});