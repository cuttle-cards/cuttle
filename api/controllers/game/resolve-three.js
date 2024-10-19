const { getCardName } = require('../../../utils/game-utils');
module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseCard = cardService.findCard({ cardId: req.body.cardId });
  Promise.all([ promiseGame, promisePlayer, promiseCard ])
    .then(function changeAndSave(values) {
      const [ game, player, card ] = values;
      const gameUpdates = {
        oneOff: null,
        resolving: null,
        passes: 0,
        turn: game.turn + 1,
        log: [
          ...game.log,
          `${player.username} took the ${getCardName(card)} from the Scrap pile to their hand.`,
        ],
        lastEvent: {
          change: 'resolveThree',
          pNum: req.session.pNum,
          chosenCard: card,
        },
      };
      const updatePromises = [
        // Update game
        Game.updateOne(game.id).set(gameUpdates),
        // Scrap the three that just resolved
        Game.addToCollection(game.id, 'scrap').members([ game.oneOff.id ]),
        // Return selected card to player's hand
        User.addToCollection(player.id, 'hand').members([ card.id ]),
        // Remove selected card from scrap
        Game.removeFromCollection(game.id, 'scrap').members([ card.id ]),
      ];
      return Promise.all([ game, card, ...updatePromises ]);
    })
    .then(function populateGame(values) {
      const [ game, card ] = values;
      return Promise.all([ gameService.populateGame({ gameId: game.id }), game, card ]);
    })
    .then(async function publishAndRespond(values) {
      const [ fullGame, gameModel, card ] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([ fullGame.id ], {
        change: 'resolveThree',
        game: fullGame,
        victory,
        chosenCard: card,
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
