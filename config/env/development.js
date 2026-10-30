/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

const { resolveDevPorts } = require('../../utils/dev-ports');

const { serverPort } = resolveDevPorts();

module.exports = {
  log: {
    level: 'debug'
  },
  // Resolved from `CUTTLE_PORT_OFFSET` / `PORT` so several dev stacks can run in parallel
  // (see utils/dev-ports.js)
  port: serverPort,
  session: {
    // Cookies are not scoped by port, so every localhost stack would otherwise share (and clobber)
    // the same session. Naming the cookie after the port keeps parallel stacks logged in
    // independently.
    name: `cuttle.sid.${serverPort}`,
  },
  // Disable default endpoints for each model e.g. GET /game/:id
  blueprints: {
    rest: false,
    shortcuts: false,
  },
  // Needed to use custom 'select' statements using sails-disk
  models: {
    schema: true,
  }
};
