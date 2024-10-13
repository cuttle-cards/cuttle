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
          if (card.rank === 12 || card.rank === 13 || card.rank === 8) {
            // Valid move -- make changes
            const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({
              game: game,
              index: req.body.index,
            });
            const playerUpdates = {
              frozenId: null,
            };
            let logEntry = `${player.username} played the ${getCardName(card)} from the top of the deck`;
            if (card.rank === 8) {
              logEntry += ' as a Glasses eight.';
            } else {
              logEntry += '.';
            }
            const gameUpdates = {
              topCard,
              secondCard,
              passes: 0,
              turn: game.turn + 1,
              resolving: null,
              lastEvent: {
                change: 'sevenFaceCard',
              },
              log: [ ...game.log, logEntry ],
            };
            const updatePromises = [
              Game.updateOne(game.id).set(gameUpdates),
              Game.removeFromCollection(game.id, 'deck').members(cardsToRemoveFromDeck),
              User.updateOne(player.id).set(playerUpdates),
              User.addToCollection(player.id, 'faceCards').members([ card.id ]),
            ];
            return Promise.all([ game, ...updatePromises ]);
          }
          return Promise.reject({
            message: 'game.snackbar.faceCards.withoutTarget',
          });
        }
        return Promise.reject({
          message: 'game.snackbar.oneOffs.seven.pickAndPlay',
        });
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
        change: 'sevenFaceCard',
        game: fullGame,
        victory,
      });
      // If the game is over, clean it up
      if (victory.gameOver) {
        await Game.updateOne({ id: fullGame.id }).set({
          lastEvent: {
            change: 'sevenFaceCard',
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
