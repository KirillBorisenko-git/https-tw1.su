import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Замени 'your-repo-name' на реальное название репозитория на GitHub
const REPO_NAME = 'B737';

export default defineConfig({
  plugins: [react()],
  base: `./`,
  build: {
    outDir: '../import',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
