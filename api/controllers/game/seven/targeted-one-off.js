const { game:gameText } = require('../../../../src/translations/en.json');
const { getCardName } = require('../../../../utils/game-utils');

module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseOpponent = userService.findUser({ userId: req.body.opId });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  const promiseTarget = cardService.findCard({ cardId: req.body.targetId });
  let promisePoint = null;
  const { targetType } = req.body;
  if (targetType === 'jack') {
    promisePoint = cardService.findCard({ cardId: req.body.pointId });
  }
  Promise.all([
    promiseGame,
    promisePlayer,
    promiseOpponent,
    promiseCard,
    promiseTarget,
    Promise.resolve(targetType),
    promisePoint,
  ])
    .then(function changeAndSave(values) {
      const [ game, player, opponent, card, target, targetType, point ] = values;
      if (game.turn % 2 === player.pNum) {
        if (card.id === game.topCard.id || card.id === game.secondCard.id) {
          if (card.rank === 2 || card.rank === 9) {
            const queenCount = userService.queenCount({ user: opponent });
            switch (queenCount) {
              case 0:
                break;
              case 1:
                if (target.faceCards === opponent.id && target.rank === 12) {
                  // break early
                  break;
                }
                return Promise.reject({
                  message: 'game.snackbar.global.blockedByQueen',
                });
              default:
                return Promise.reject({
                  message: 'game.snackbar.global.blockedByMultipleQueens',
                });
            } // End queenCount validation
            const { topCard, secondCard, cardsToRemoveFromDeck } = gameService.sevenCleanUp({
              game: game,
              index: req.body.index,
            });
            const gameUpdates = {
              topCard,
              secondCard,
              resolving: null,
              oneOff: card.id,
              oneOffTarget: target.id,
              oneOffTargetType: targetType,
              attachedToTarget: null,
              log: [
                ...game.log,
                `${player.username} played the ${getCardName(card)} from the top of the deck as a one-off to ${gameText.moves.effects[card.rank]}, targeting the ${getCardName(target)}.`,
              ],
              lastEvent: {
                change: 'sevenTargetedOneOff',
                pNum: req.session.pNum,
              },
            };

            if (point) {
              gameUpdates.attachedToTarget = point.id;
            }

            const updatePromises = [
              Game.updateOne(game.id).set(gameUpdates),
              Game.removeFromCollection(game.id, 'deck').members(cardsToRemoveFromDeck),
            ];

            return Promise.all([ game, ...updatePromises ]);
          }
        } else {
          return Promise.reject({
            message: 'game.snackbar.oneOffs.seven.pickAndPlay',
          });
        }
      } else {
        return Promise.reject({ message: 'game.snackbar.global.notYourTurn' });
      }
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
        change: 'sevenTargetedOneOff',
        game: fullGame,
        victory,
        pNum: req.session.pNum,
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
