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

module.exports = {
  log: {
    level: 'debug'
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
