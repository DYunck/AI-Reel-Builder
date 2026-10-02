import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// `vite build --mode pages` (npm run build:pages) produces a GitHub Pages build:
// relative asset paths so it works under /<repo-name>/, plus hash-based URLs (.env.pages).
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? './' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}));
