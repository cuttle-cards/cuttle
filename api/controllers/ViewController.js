const path = require('path');

const indexHtmlFile = path.resolve(__dirname, '../../assets/index.html');

module.exports = {
  serveIndex: function (req, res) {
    return res.sendFile(indexHtmlFile, (err) => {
      if (err) {
        return res.status(500).send('Internal Server Error: could not resolve index.html');
      }
    });
  },
};
