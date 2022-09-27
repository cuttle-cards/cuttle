import path from 'path';
import { fileURLToPath } from 'url';

// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
