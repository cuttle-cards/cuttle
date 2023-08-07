import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROXY_HOST = process.env.CUTTLE_DOCKERIZED === true
  ? 'http://localhost:1337'
  : 'http://cuttle-server:1337';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: false,
      styles: { configFile: 'src/sass/variables.scss'}
    }),
  ],
  resolve: {
    alias: {
      _: resolve(__dirname),
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    proxy: {
      '/game': {
        target: PROXY_HOST,
        changeOrigin: true,
      },
      // Required for the health response to work on the client
      '/health': {
        target: PROXY_HOST,
        changeOrigin: true,
      },
      '/user': {
        target: PROXY_HOST,
        changeOrigin: true,
      },
      '/test': {
        target: PROXY_HOST,
        changeOrigin: true,
      },
    },
  },
  test: {
    include: ['**/tests/unit/**/*.{j,t}s?(x)'],
  },
  build: {
    outDir: 'assets',
  },
});
