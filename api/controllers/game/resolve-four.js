const { getCardName } = require('../../../utils/game-utils');
module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  const promiseCard1 = cardService.findCard({ cardId: req.body.cardId1 });
  let promiseCard2 = null;
  if (Object.hasOwnProperty.call(req.body, 'cardId2')) {
    promiseCard2 = cardService.findCard({ cardId: req.body.cardId2 });
  }
  Promise.all([ promiseGame, promisePlayer, promiseCard1, promiseCard2 ])
    .then(function changeAndSave(values) {
      const [ game, player, card1, card2 ] = values;
      // Validate discard
      if (
        // missing both cards
        (!card1 && !card2) ||
        // discarding fewer than 2
        (player.hand.length >= 2 && (!card1 || !card2)) ||
        // card1 was not in player's hand
        (card1 && card1.hand != player.id) ||
        // card2 was not in player's hand
        (card2 && card2.hand != player.id)
      ) {
        return Promise.reject({ message: 'You must select two cards to discard' });
      }
      const cardsToScrap = [ card1.id ];
      const gameUpdates = {
        passes: 0,
        turn: game.turn + 1,
        resolving: null,
        lastEvent: {
          change: 'resolveFour',
        },
      };
      if (card2 !== null) {
        cardsToScrap.push(card2.id);
        gameUpdates.log = [
          ...game.log,
          `${player.username} discarded the ${getCardName(card1)} and the ${getCardName(card2)}.`,
        ];
      } else {
        gameUpdates.log = [ ...game.log, `${player.username} discarded the ${getCardName(card1)}.` ];
      }
      gameUpdates.lastEvent.discardedCards = cardsToScrap;
      
      const updatePromises = [
        Game.updateOne(game.id).set(gameUpdates),
        Game.addToCollection(game.id, 'scrap').members(cardsToScrap),
        User.removeFromCollection(player.id, 'hand').members(cardsToScrap),
      ];
      return Promise.all([ game,cardsToScrap, ...updatePromises ]);
    }) // End changeAndSave
    .then(function populateGame(values) {
      const [ game, cardsToScrap ] = values;
      return Promise.all([ gameService.populateGame({ gameId: game.id }), game, cardsToScrap ]);
    })
    .then(async function publishAndRespond(values) {
      const [ fullGame, gameModel, discardedCards ] = values;
      const victory = await gameService.checkWinGame({
        game: fullGame,
        gameModel,
      });
      Game.publish([ fullGame.id ], {
        change: 'resolveFour',
        game: fullGame,
        victory,
        discardedCards
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
