import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // for easy GitHub Pages deployment or sub-path serving
  server: {
    port: 3000,
    open: false
  }
});
