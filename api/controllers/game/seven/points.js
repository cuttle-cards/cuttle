module.exports = function (req, res) {
  const Promise = require("bluebird");
  const promiseGame = gameService.findGame({gameId: req.session.game});
  const promisePlayer = userService.findUser({userId: req.session.usr});
  const promiseCard = cardService.findCard({cardId: req.body.cardId});
  Promise.all([promiseGame, promisePlayer, promiseCard])
    .then(function changeAndSave(values) {
      const [game, player, card] = values;
      if (game.turn % 2 === player.pNum) {
        if (game.topCard.id === card.id || game.secondCard.id === card.id) {
          if (card.rank < 11) {
            const {topCard, secondCard, cardsToRemoveFromDeck} = gameService.sevenCleanUp({
              game: game,
              index: req.body.index
            });
            const playerUpdates = {
              frozenId: null,
            };
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
                `${userService.truncateEmail(player.email)} played the ${card.name} from the top of the deck for points.`,
              ],
            };
            const updatePromises = [
              Game.updateOne(game.id)
                .set(gameUpdates),
              Game.removeFromCollection(game.id, 'deck')
                .members(cardsToRemoveFromDeck),
              User.updateOne(player.id)
                .set(playerUpdates),
              User.addToCollection(player.id, 'points')
                .members([card.id]),
            ];
            return Promise.all([game, ...updatePromises]);
          } else {
            return Promise.reject({message: "You can only play Ace - Ten cards as points"});
          }
        } else {
          return Promise.reject({message: "You must pick a card from the deck to play when resolving a seven"});
        }
      } else {
        return Promise.reject({message: "It's not your turn"});
      }
    })
    .then(function populateGame(values) {
      const [game] = values;
      return Promise.all([gameService.populateGame({gameId: game.id}), game]);
    })
    .then(async function publishAndRespond(values) {
      const fullGame = values[0];
      const gameModel = values[1];
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([fullGame.id], {
        verb: 'updated',
        data: {
          change: 'sevenPoints',
          game: fullGame,
          victory,
        },
      });
      // If the game is over, clean it up
      if (victory.gameOver) await gameService.clearGame({userId: req.session.usr})
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
}
