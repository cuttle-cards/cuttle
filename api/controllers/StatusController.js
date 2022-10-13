const statusAPI = sails.hooks['apistatushook'];

const isDatabaseAvailable = () => {
  return statusAPI.getStatus();
};

const getPackageVersion = () => {
  // 'npm_package_version' is only available when the server is started via an npm script
  return process.env.npm_package_version || 'unknown';
};

module.exports = {
  getStatus: async function (req, res) {
    const dbAvailable = await isDatabaseAvailable();
    const packageVersion = getPackageVersion();

    return res.json({
      available: dbAvailable,
      version: packageVersion,
    });
  },
};
