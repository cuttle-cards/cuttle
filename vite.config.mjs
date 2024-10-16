import os from 'os';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// vite.config.mjs
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

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
        '/api': {
          target: HOST_SERVER_URL,
          changeOrigin: true,
        },
      },
      // Watching doesn't work on windows, so we need to use polling -- this does lead to high CPU
      // usage though, which is a bit of a bummer.
      // point, see https://v3.vitejs.dev/config/server-options.html#server-watch
      watch: {
        // returns 'win32' for Windows, regardless of the architecture
        usePolling: os.platform() === 'win32',
      },
    },
    build: {
      outDir: 'assets',
    },
  };
});
