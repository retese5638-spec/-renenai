import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/-renenai/', // Repo adınla birebir aynı olmalı
  build: {
    outDir: 'dist',
  }
});
