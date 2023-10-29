import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // See https://vitejs.dev/config/#using-environment-variables-in-config
  const env = loadEnv(mode, process.cwd(), '');
  let HOST_SERVER_URL = 'http://localhost:1337';
  if (env.CUTTLE_DOCKERIZED === 'true') {
    // This needs to be the hostname of the docker container, not localhost since it happens
    // on the server side as a proxy from vite server to the sailsjs container
    HOST_SERVER_URL = 'http://server:1337';
    console.log(`Running Cuttle in DOCKER, setting server url to "${HOST_SERVER_URL}"`);
  }

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: {
          name: 'Cuttle.cards',
          short_name: 'Cuttle',
          description: 'The deepest card game under the sea!',
          theme_color: '#FFF4D7',
          background_color: '#FFF4D7',
          display: 'fullscreen',
          id: '/#/',
          start_url: 'cuttle.cards/#/',
          icons: [
            {
              src: '/pwa-icons/logo-head-72.png',
              sizes: '72x72',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-96.png',
              sizes: '96x96',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-120.png',
              sizes: '120x120',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-128.png',
              sizes: '128x128',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-144.png',
              sizes: '144x144',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-152.png',
              sizes: '152x152',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-180.png',
              sizes: '180x180',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-384.png',
              sizes: '384x384',
              type: 'image/png',
            },
            {
              src: '/pwa-icons/logo-head-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
      vuetify({
        autoImport: false,
        styles: { configFile: 'src/sass/variables.scss' },
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
      cors: false,
      proxy: {
        '/game': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
        // Required for the health response to work on the client
        '/health': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
        '/user': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
        '/test': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
      },
      // Watching doesn't work on windows, so we need to use polling -- this does lead to high CPU
      // usage though, which is a bit of a bummer. Should probably make this conditional at some
      // point, see https://v3.vitejs.dev/config/server-options.html#server-watch
      watch: {
        usePolling: true,
      },
    },
    test: {
      include: ['**/tests/unit/**/*.{j,t}s?(x)'],
    },
    build: {
      outDir: 'assets',
    },
  };
});
