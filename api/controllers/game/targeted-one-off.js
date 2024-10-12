const { game:gameText } = require('../../../src/translations/en.json');
const { getCardName } = require('../../../utils/game-utils');

module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseOpponent = userService.findUser({ userId: req.body.opId });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  const promiseTarget = cardService.findCard({ cardId: req.body.targetId });
  const { targetType } = req.body;
  let promisePoint = null;
  if (targetType === 'jack') {
    promisePoint = cardService.findCard({ cardId: req.body.pointId });
  } else {
    promisePoint = Promise.resolve(null);
  }
  Promise.all([
    promiseGame,
    promisePlayer,
    promiseOpponent,
    promiseCard,
    promiseTarget,
    targetType,
    promisePoint,
  ])
    .then(function changeAndSave(values) {
      const [ game, player, opponent, card, target, targetType, point ] = values;
      if (player.pNum === game.turn % 2) {
        if (!game.oneOff) {
          if (card.hand === player.id) {
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
                    message:
                      'game.snackbar.global.blockedByMultipleQueens',
                  });
              }
              if (player.frozenId !== card.id) {
                // Move is valid -- make changes
                const gameUpdates = {
                  oneOff: card.id,
                  oneOffTarget: target.id,
                  oneOffTargetType: targetType,
                  attachedToTarget: null,
                  log: [
                    ...game.log,
                    `${player.username} played the ${getCardName(card)} as a one-off to: ${gameText.moves.effects[card.rank]}, targeting the ${getCardName(target)}.`,
                  ],
                  lastEvent: {
                    change: 'targetedOneOff',
                    pNum: req.session.pNum,
                  },
                };
                if (point) {
                  gameUpdates.attachedToTarget = point.id;
                }

                const playerUpdates = { frozenId: null };

                const updatePromises = [
                  Game.updateOne(game.id).set(gameUpdates),
                  // Remove one-off from player's hand
                  User.removeFromCollection(player.id, 'hand').members([ card.id ]),
                  User.updateOne(player.id).set(playerUpdates),
                ];
                return Promise.all([ game, ...updatePromises ]);
              }
              return Promise.reject({
                message: 'game.snackbar.global.cardFrozen',
              });
            }
            return Promise.reject({
              message: 'game.snackbar.oneOffs.onlyTwoOrNine',
            });
          }
          return Promise.reject({ message: 'game.snackbar.global.playFromHand' });
        }
        return Promise.reject({
          message: 'game.snackbar.oneOffs.oneOffInPlay',
        });
      }
      return Promise.reject({ message: 'game.snackbar.global.notYourTurn' });
    }) // End changeAndSave()
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
        change: 'targetedOneOff',
        game: fullGame,
        pNum: req.session.pNum,
        victory,
      });
      return res.ok();
    }) // End publishAndRespond
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
