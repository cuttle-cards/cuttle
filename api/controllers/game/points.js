const { getCardName } = require('../../../utils/game-utils');
module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  Promise.all([promiseGame, promisePlayer, promiseCard])
    .then(function changeAndSave(values) {
      const [game, player, card] = values;

      if (game.turn % 2 === player.pNum) {
        if (card.hand === player.id) {
          if (card.rank <= 10) {
            if (player.frozenId !== card.id) {
              // Move is legal; make changes
              const gameUpdates = {
                passes: 0,
                turn: game.turn + 1,
                log: [...game.log, `${player.username} played the ${getCardName(card)} for points`],
                lastEvent: {
                  change: 'points',
                },
              };
              const playerUpdates = {
                frozenId: null,
              };
              const updatePromises = [
                Game.updateOne({ id: game.id }).set(gameUpdates),
                User.updateOne({ id: player.id }).set(playerUpdates),
                User.removeFromCollection(player.id, 'hand').members(card.id),
                User.addToCollection(player.id, 'points').members(card.id),
              ];
              return Promise.all([game, ...updatePromises]);
            }
            return Promise.reject({
              message: 'That card is frozen! You must wait a turn to play it',
            });
          }
          return Promise.reject({ message: 'You can only play a number card as points.' });
        }
        return Promise.reject({ message: 'You can only play a card that is in your hand.' });
      }
      return Promise.reject({ message: "It's not your turn." });
    })
    .then(function populateGame(values) {
      const [game] = values;
      return Promise.all([gameService.populateGame({ gameId: game.id }), game]);
    })
    .then(async function publishAndRespond(values) {
      const [fullGame, gameModel] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([fullGame.id], {
        change: 'points',
        game: fullGame,
        victory,
      });
      // If the game is over, clean it up
      if (victory.gameOver) {
        await gameService.clearGame({ userId: req.session.usr });
      }
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
