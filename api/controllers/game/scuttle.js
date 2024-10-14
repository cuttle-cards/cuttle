const { getCardName } = require('../../../utils/game-utils');
module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseOpponent = userService.findUser({ userId: req.body.opId });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  const promiseTarget = cardService.findCard({ cardId: req.body.targetId });
  Promise.all([ promiseGame, promisePlayer, promiseOpponent, promiseCard, promiseTarget ])
    .then(function changeAndSave(values) {
      const [ game, player, opponent, card, target ] = values;
      if (game.turn % 2 !== player.pNum) {
        return Promise.reject({ message: 'game.snackbar.global.notYourTurn' });
      }
      if (card.hand !== player.id) {
        return Promise.reject({ message: 'game.snackbar.global.playFromHand' });
      }
      if (target.points !== opponent.id) {
        return Promise.reject({
          message: 'game.snackbar.scuttle.mustTargetPointCard',
        });
      }
      if (card.rank < target.rank || (card.rank === target.rank && card.suit < target.suit)) {
        return Promise.reject({
          message:
            'game.snackbar.scuttle.rankTooLow',
        });
      }
      if (player.frozenId === card.id) {
        return Promise.reject({ message: 'game.snackbar.global.cardFrozen' });
      }
      // Move is legal; make changes
      const attachmentIds = target.attachments.map((card) => card.id);
      const logMessage = `${player.username} scuttled ${opponent.username}'s ${getCardName(target)} with the ${getCardName(card)}`;
      // Define update dictionaries
      const gameUpdates = {
        passes: 0,
        turn: game.turn + 1,
        log: [ ...game.log, logMessage ],
        lastEvent: {
          change: 'scuttle',
        },
      };
      const playerUpdates = {
        frozenId: null,
      };
      // Consolidate update promises into array
      const updatePromises = [
        // Include game record so it can be retrieved downstream
        game,
        // Updates to game record e.g. turn
        Game.updateOne(game.id).set(gameUpdates),
        // Updates to player record i.e. frozenId
        User.updateOne(player.id).set(playerUpdates),
        // Clear target's attachments
        Card.replaceCollection(target.id, 'attachments').members([]),
        // Remove card from player's hand
        User.removeFromCollection(player.id, 'hand').members([ card.id ]),
        // Remove target from opponent's points
        User.removeFromCollection(opponent.id, 'points').members([ target.id ]),
        // Scrap cards
        Game.addToCollection(game.id, 'scrap').members([ ...attachmentIds, card.id, target.id ]),
      ];
      return Promise.all(updatePromises);
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
        change: 'scuttle',
        game: fullGame,
        victory,
        playedCardId: req.body.cardId,
        targetCardId: req.body.targetId,
        playedBy: req.session.pNum,
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
