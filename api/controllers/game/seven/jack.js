module.exports = function(req, res) {
  const Promise = require('bluebird');
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseOpponent = userService.findUser({ userId: req.body.opId });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  const promiseTarget =
    req.body.targetId !== -1 ? cardService.findCard({ cardId: req.body.targetId }) : -1; // -1 for double jacks with no points to steal special case
  let promises = [promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget];
  Promise.all(promises)
    .then(function changeAndSave(values) {
      const [game, player, opponent, card, target] = values;
      let gameUpdates = {
        passes: 0,
        turn: game.turn + 1,
        resolving: null,
      };
      let playerUpdates = {
        frozenId: null,
      };
      let updatePromises = [];
      if (game.turn % 2 === player.pNum) {
        if (card.id === game.topCard.id || card.id === game.secondCard.id) {
          // special case - seven double jacks with no points to steal
          if (target === -1) {
            const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({
              game: game,
              index: req.body.index,
            });
            gameUpdates = {
              ...gameUpdates,
              topCard,
              secondCard,
              log: [
                ...game.log,
                `${player.username} scrapped ${card.name}, since there are no point cards to steal on ${opponent.username}'s field.`,
              ],
              lastEvent: {
                change: 'sevenJack',
              },
            };

            updatePromises = [
              Game.updateOne(game.id).set(gameUpdates),
              User.updateOne(player.id).set(playerUpdates),
              Game.addToCollection(game.id, 'scrap').members([card.id]),
              Game.removeFromCollection(game.id, 'deck').members(cardsToRemoveFromDeck),
            ];
            return Promise.all([game, ...updatePromises]);
          } else {
            const queenCount = userService.queenCount({ user: opponent });
            switch (queenCount) {
              case 0:
                break;
              case 1:
                if (target.faceCards === opponent.id && target.rank === 12) {
                } else {
                  return Promise.reject({
                    message: "Your opponent's queen prevents you from targeting their other cards",
                  });
                }
                break;
              default:
                return Promise.reject({
                  message:
                    'You cannot play a targeted one-off when your opponent has more than one Queen',
                });
            } //End queenCount validation
            // Normal sevens
            if (target.points === opponent.id) {
              if (card.rank === 11) {
                const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({
                  game: game,
                  index: req.body.index,
                });
                const cardUpdates = {
                  index: target.attachments.length,
                };
                gameUpdates = {
                  ...gameUpdates,
                  topCard,
                  secondCard,
                  log: [
                    ...game.log,
                    `${player.username} stole ${opponent.username}'s ${target.name} with the ${card.name} from the top of the deck.`,
                  ],
                };
                updatePromises = [
                  Game.updateOne(game.id).set(gameUpdates),
                  User.updateOne(player.id).set(playerUpdates),
                  // Set card's index within attachments
                  Card.updateOne(card.id).set(cardUpdates),
                  // Remove new second card fromd eck
                  Game.removeFromCollection(game.id, 'deck').members(cardsToRemoveFromDeck),
                  // Add jack to target's attachments
                  Card.addToCollection(target.id, 'attachments').members([card.id]),
                  // Steal point card
                  User.addToCollection(player.id, 'points').members([target.id]),
                ];
                return Promise.all([game, ...updatePromises]);
              } else {
                return Promise.reject({
                  message: "You can only steal your opponent's points with a jack",
                });
              }
            } else {
              return Promise.reject({ message: "You can only jack your opponent's point cards" });
            }
          }
        } else {
          return Promise.reject({
            message: 'You can only one of the top two cards from the deck while resolving a seven',
          });
        }
      } else {
        return Promise.reject({ message: "It's not your turn" });
      }
    })
    .then(function populateGame(values) {
      return Promise.all([gameService.populateGame({ gameId: values[0].id }), values[0]]);
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
          change: 'sevenJack',
          game: fullGame,
          victory,
        },
      });
      // If the game is over, clean it up
      if (victory.gameOver) await gameService.clearGame({ userId: req.session.usr });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
