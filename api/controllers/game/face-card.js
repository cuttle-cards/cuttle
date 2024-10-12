const { getCardName } = require('../../../utils/game-utils');
module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  Promise.all([ promiseGame, promisePlayer, promiseCard ])
    .then(function changeAndSave(values) {
      const [ game, player, card ] = values;
      if (game.turn % 2 === player.pNum) {
        if (card.hand === player.id) {
          if ((card.rank >= 12 && card.rank <= 13) || card.rank === 8) {
            if (player.frozenId !== card.id) {
              // Everything okay; make changes
              let logEntry = `${player.username} played the ${getCardName(card)}`;
              if (card.rank === 8) {
                logEntry += ' as a Glasses eight';
              }
              const gameUpdates = {
                turn: game.turn + 1,
                log: [ ...game.log, logEntry ],
                passes: 0,
                lastEvent: {
                  change: 'faceCard',
                },
              };

              const playerUpdates = {
                frozenId: null,
              };

              const updatePromises = [
                Game.updateOne({ id: game.id }).set(gameUpdates),
                User.updateOne({ id: player.id }).set(playerUpdates),
                User.removeFromCollection(player.id, 'hand').members(card.id),
                User.addToCollection(player.id, 'faceCards').members(card.id),
              ];

              return Promise.all([ game, ...updatePromises ]);
            }
            return Promise.reject({
              message: 'game.snackbar.global.cardFrozen',
            });
          }
          return Promise.reject({
            message: 'game.snackbar.faceCard.withoutTarget',
          });
        }
        return Promise.reject({ message: 'game.snackbar.global.playFromHand' });
      }
      return Promise.reject({ message: 'game.snackbar.global.notYourTurn' });
    })
    .then(function populateGame(values) {
      const [ game ] = values;
      return Promise.all([ gameService.populateGame({ gameId: game.id }), game ]);
    })
    .then(async function publishAndRespond(values) {
      const [ fullGame, gameModel ] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([ fullGame.id ], {
        change: 'faceCard',
        game: fullGame,
        victory,
      });
      // If the game is over, clean it up
      if (victory.gameOver) {
        await Game.updateOne({ id: fullGame.id }).set({
          lastEvent: {
            change: 'faceCard',
            game: fullGame,
            victory
          }
        });
        await gameService.clearGame({ userId: req.session.usr });
      }
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
