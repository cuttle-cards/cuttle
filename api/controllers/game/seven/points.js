const { getCardName } = require('../../../../utils/game-utils');
module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  Promise.all([ promiseGame, promisePlayer, promiseCard ])
    .then(function changeAndSave(values) {
      const [ game, player, card ] = values;
      if (game.turn % 2 === player.pNum) {
        if (game.topCard.id === card.id || game.secondCard.id === card.id) {
          if (card.rank < 11) {
            const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({
              game: game,
              index: req.body.index,
            });
            const gameUpdates = {
              topCard,
              secondCard,
              passes: 0,
              turn: game.turn + 1,
              resolving: null,
              lastEvent: {
                change: 'sevenPoints',
              },
              log: [
                ...game.log,
                `${player.username} played the ${getCardName(card)} from the top of the deck for points.`,
              ],
            };
            const updatePromises = [
              Game.updateOne(game.id).set(gameUpdates),
              Game.removeFromCollection(game.id, 'deck').members(cardsToRemoveFromDeck),
              User.addToCollection(player.id, 'points').members([ card.id ]),
            ];
            return Promise.all([ game, ...updatePromises ]);
          }
          return Promise.reject({ message: 'game.snackbar.points.numberOnlyForPoints' });
        }
        return Promise.reject({
          message: 'game.snackbar.oneOffs.seven.pickAndPlay',
        });
      }
      return Promise.reject({ message: "It's not your turn" });
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
        change: 'sevenPoints',
        game: fullGame,
        victory,
      });
      // If the game is over, clean it up
      if (victory.gameOver) {
        await Game.updateOne({ id: fullGame.id }).set({
          lastEvent: {
            change: 'sevenPoints',
            game: fullGame,
            victory,
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
