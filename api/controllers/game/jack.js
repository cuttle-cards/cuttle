const { getCardName } = require('../../../utils/game-utils');
module.exports = function (req, res) {
  const game = gameService.findGame({ gameId: req.session.game });
  const player = userService.findUser({ userId: req.session.usr });
  const opponent = userService.findUser({ userId: req.body.opId });
  const card = cardService.findCard({ cardId: req.body.cardId });
  const target = cardService.findCard({ cardId: req.body.targetId });
  Promise.all([ game, player, opponent, card, target ])
    .then(function changeAndSave(values) {
      const [ game, player, opponent, card, target ] = values;
      if (game.turn % 2 === player.pNum) {
        if (card.hand === player.id) {
          if (card.rank === 11) {
            if (target.points === opponent.id) {
              const queenCount = userService.queenCount({ user: opponent });
              if (queenCount === 0) {
                if (player.frozenId !== card.id) {
                  // Valid move; change and save
                  const gameUpdates = {
                    log: [
                      ...game.log,
                      `${player.username} stole ${opponent.username}'s ${getCardName(target)} with the ${getCardName(card)}`,
                    ],
                    turn: game.turn + 1,
                    passes: 0,
                    lastEvent: {
                      change: 'jack',
                    },
                  };
                  const playerUpdates = {
                    frozenId: null,
                  };
                  const cardUpdates = {
                    index: target.attachments.length,
                  };
                  const updatePromises = [
                    Game.updateOne(game.id).set(gameUpdates),
                    User.updateOne(player.id).set(playerUpdates),
                    User.addToCollection(player.id, 'points').members([ target.id ]),
                    User.removeFromCollection(player.id, 'hand').members([ card.id ]),
                    Card.updateOne(card.id).set(cardUpdates),
                    Card.addToCollection(target.id, 'attachments').members([ card.id ]),
                  ];
                  return Promise.all([ game, ...updatePromises ]);
                }
                return Promise.reject({
                  message: 'game.snackbar.global.cardFrozen',
                });
              }
              return Promise.reject({
                message: 'game.snackbar.jack.noJackWithQueen',
              });
            }
            return Promise.reject({
              message: 'game.snackbar.jack.stealOnlyPointCards',
            });
          }
          return Promise.reject({
            message: 'game.snackbar.jack.stealOnlyPointCards',
          });
        }
        return Promise.reject({ message: 'game.snackbar.global.playFromHand' });
      }
      return Promise.reject({ message: 'game.snackbar.global.notYourTurn' });
    }) // End changeAndSave()
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
        change: 'jack',
        game: fullGame,
        victory,
      });
      // If the game is over, clean it up
      if (victory.gameOver) {
        await Game.updateOne({ id: fullGame.id }).set({
          lastEvent: {
            change: 'jack',
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
