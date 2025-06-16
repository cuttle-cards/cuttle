const { version: pkgVersion } = require('../../package.json');

const getPackageVersion = () => {
  // 'npm_package_version' is only available when the server is started via an npm script
  return pkgVersion || process.env.npm_package_version || 'unknown';
};

module.exports = {
  getHealth: async function (req, res) {
    const dbAvailable = await sails.helpers.getApiHealth();
    const packageVersion = getPackageVersion();

    return res.json({
      alive: dbAvailable,
      version: packageVersion,
    });
  },
};
