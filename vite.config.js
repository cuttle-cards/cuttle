import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: false,
    }),
  ],
  resolve: {
    alias: {
      _: resolve(__dirname),
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    strictPort: true,
    proxy: {
      '/game': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
      '/test': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
    },
  },
});
