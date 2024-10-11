const { getCardName } = require('../../../utils/game-utils');
module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseOpponent = userService.findUser({ userId: req.body.opId });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  Promise.all([ promiseGame, promisePlayer, promiseOpponent, promiseCard ])
    .then(function changeAndSave(values) {
      const [ game, player, opponent, card ] = values;

      const queenCount = userService.queenCount({ user: opponent });
      const opHasQueen = queenCount > 0;
      let logEntry;
      if (card.hand === player.id) {
        if (game.oneOff) {
          if (card.rank === 2) {
            if (!opHasQueen) {
              if (game.twos.length > 0) {
                logEntry = `${player.username} played the ${getCardName(card)} to counter ${opponent.username}'s ${
                  getCardName(game.twos[game.twos.length - 1])
                }.`;
              } else {
                logEntry = `${player.username} played the ${getCardName(card)} to counter ${opponent.username}'s ${getCardName(game.oneOff)}.`;
              }
              const gameUpdates = {
                lastEvent: {
                  change: 'counter',
                  pNum: req.session.pNum,
                  log: [ ...logEntry, game.log ],
                },
              };
              const updatePromises = [
                Game.updateOne(game.id).set(gameUpdates),
                Game.addToCollection(game.id, 'twos').members([ card.id ]),
                User.removeFromCollection(player.id, 'hand').members([ card.id ]),
              ];

              return Promise.all([ game, ...updatePromises ]);
            }
            return Promise.reject({
              message: "You cannot counter your opponent's one-off while they have a Queen.",
            });
          }
          return Promise.reject({ message: 'You can only play a Two to counter a one-off' });
        }
        return Promise.reject({
          message: 'You can only counter a one-off that is already in play',
        });
      }
      return Promise.reject({ message: 'You can only play a card that is in your hand' });
    }) // End changeAndSave
    .then(function populateGame(values) {
      return Promise.all([ gameService.populateGame({ gameId: values[0].id }), values[0] ]);
    })
    .then(async function publishAndRespond(values) {
      const [ fullGame, gameModel ] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([ fullGame.id ], {
        change: 'counter',
        game: fullGame,
        pNum: req.session.pNum,
        victory,
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
