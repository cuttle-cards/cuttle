const path = require('path');

module.exports = {
  serveIndex: function (req, res) {
     // You can specify the path to your Vue.js index.html here
     const vueIndexPath = path.join(__dirname, '../../', 'index.html');
     // Serve the Vue.js index.html file
     return res.sendFile(vueIndexPath);
  },
};