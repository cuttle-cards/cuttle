/**
 * Dev port resolution
 *
 * Every port the local stack binds is resolved here so that the client, the server, and the tests
 * can never drift onto different ports. This is what makes it possible to run several cuttle
 * stacks (e.g. one per git worktree) side by side on the same machine.
 *
 * The simplest way to move a whole stack out of the way of another one is to set
 * `CUTTLE_PORT_OFFSET` in a git-ignored `.env.local` (see `.env.local.example`):
 *
 *   CUTTLE_PORT_OFFSET=1   ->   client on 8081, server on 1338
 *
 * Individual ports can be pinned instead with `CUTTLE_CLIENT_PORT` / `PORT`; those win over the
 * offset. Real environment variables always win over `.env.local`.
 */
// This module is bundled into vite's config as well as required by sails and cypress, so it
// deliberately has no imports at all -- bundlers can't rewrite `require('fs')` into ESM.
const DEFAULT_CLIENT_PORT = 8080;
const DEFAULT_SERVER_PORT = 1337;

const LOCAL_ENV_FILE = `${__dirname}/../.env.local`;

/**
 * Load `.env.local` into process.env for processes that don't read env files themselves
 * (sails, cypress). Node leaves variables that are already set in the real environment alone,
 * so an inline `CUTTLE_PORT_OFFSET=2 npm run ...` still wins over the file.
 */
const loadLocalEnv = () => {
  try {
    process.loadEnvFile(LOCAL_ENV_FILE);
  } catch (err) {
    // There's usually no .env.local; anything else is worth knowing about
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
};

const toPort = (value) => {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port >= 0 && port <= 65535 ? port : null;
};

/**
 * Resolve the ports (and the localhost urls built from them) for this stack.
 *
 * @param {object} env - map of environment variables; defaults to process.env. Vite passes the
 *   result of its own `loadEnv` here, since that includes `.env` files it has already read.
 */
const resolveDevPorts = (env = process.env) => {
  const offset = toPort(env.CUTTLE_PORT_OFFSET) ?? 0;
  const clientPort = toPort(env.CUTTLE_CLIENT_PORT) ?? DEFAULT_CLIENT_PORT + offset;
  const serverPort = toPort(env.PORT) ?? DEFAULT_SERVER_PORT + offset;

  return {
    offset,
    clientPort,
    serverPort,
    frontendUrl: `http://localhost:${clientPort}`,
    apiUrl: `http://localhost:${serverPort}`,
  };
};

/**
 * Resolve this stack's ports and backfill the environment variables derived from them, so that
 * code reading `process.env` directly (e.g. the oauth helpers' redirect uris) points at this
 * stack rather than the default one. Anything already present in the environment is left as-is.
 */
const applyDevEnv = (env = process.env) => {
  loadLocalEnv();

  const ports = resolveDevPorts(env);
  env.PORT ??= String(ports.serverPort);
  env.VITE_API_URL ??= ports.apiUrl;
  env.VITE_FRONTEND_URL ??= ports.frontendUrl;

  return ports;
};

module.exports = {
  DEFAULT_CLIENT_PORT,
  DEFAULT_SERVER_PORT,
  loadLocalEnv,
  resolveDevPorts,
  applyDevEnv,
};
