const { join } = require('path');

const ASSETS_PATH = join(__dirname, '../../assets');

function serveIndex(req, res, next) {
  try {
    const isFile = req.url.startsWith('/assets') || req.url.includes('.');
    if (isFile) {
      return next();
    }
    return res.sendFile('index.html', { root: ASSETS_PATH });
  } catch (err) {
    return res.badRequest(err);
  }
}

module.exports = serveIndex;
