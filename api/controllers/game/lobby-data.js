const { getLobbyDataByGame } = require('../../../utils/game-utils');

module.exports = function returnLobbyData(req, res) {
  gameService
    .findGame({ gameId: req.session.game })
    .then(function sendResponse(game) {
      const lobbyData = getLobbyDataByGame(game);
      if (!lobbyData) {
        throw new Error('Unable to get lobby data');
      }
      return lobbyData;
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
