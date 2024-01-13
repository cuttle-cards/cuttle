const { getCardName } = require('../../../utils/game-utils');
const gameService = require('../../services/gameService');

module.exports = async function (req, res) {
  
  try {
    const promiseGame = gameService.findGame({ gameId: req.session.game });
    const promisePlayer = User.findOne({ id: req.session.usr });
    const promiseCard = cardService.findCard({ cardId: req.body.cardId1 });

    const [game, player, card] = await Promise.all([promiseGame, promisePlayer, promiseCard]);
    const cardsToDraw = [];

    let newDeck = game.deck;

    if (player.hand.length < 8) {
      cardsToDraw.push(game.topCard.id);
      gameUpdates.topCard = null;
      if (game.secondCard && player.hand.length < 7) {
        cardsToDraw.push(game.secondCard.id);
        gameUpdates.secondCard = null;
        if (game.deck.length > 1 && player.hand.length < 6) {
          const thirdCard = _.sample(game.deck);
          cardsToDraw.push(thirdCard.id);
          newDeck = game.deck.filter(({ id }) => id !== thirdCard);
        }
      }
    }
  
    const logMessage = cardsToDraw.length === 1 ? `${player.username} draws 1 card` : `${player.username} draws ${cardsToDraw.length} cards`;
    const gameUpdates = {
      passes: 0,
      turn: game.turn + 1,
      resolving: null,
      lastEvent: {
        change: 'resolveFive',
        discardedCards: [card.id]
      },
      log: [...game.log, `The ${getCardName(game.oneOff)} one-off resolves. ${logMessage}`]
    };

    if (game.deck.length > 1) {
      const [topCard, secondCard] = _.sampleSize(newDeck, 2);
      gameUpdates.topCard = topCard;
      gameUpdates.secondCard = secondCard;
    } else if (game.deck.length === 1) {
      [gameUpdates.topCard] = newDeck;
    }

    const updatePromises = [
      Game.updateOne(game.id).set(gameUpdates),
      Game.addToCollection(game.id, 'scrap').members([card.id]),
      User.removeFromCollection(player.id, 'hand').members([card.id]),
      User.addToCollection(player.id, 'hand').members([cardsToDraw]),
    ];

    await Promise.all([...updatePromises]);
    const fullGame = await gameService.populateGame({ gameId: game.id });
    const victory = await gameService.checkWinGame({ game: fullGame });

    Game.publish([fullGame.id], {
      change: 'resolveFive',
      game: fullGame,
      victory,
      discardedCards: [card.id]
    });

    return res.ok();
  } catch(err) {
    return res.badRequest(err);
  }
};