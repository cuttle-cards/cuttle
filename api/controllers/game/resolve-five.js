const { getCardName } = require('../../../utils/game-utils');
module.exports = async function (req, res) {
  
  try {
    const promiseGame = gameService.findGame({ gameId: req.session.game });
    const promisePlayer = userService.findUser({ userId: req.session.usr });
    const promiseCard = cardService.findCard({ cardId: req.body.cardId });
    const [game, player, card] = await Promise.all([promiseGame, promisePlayer, promiseCard]);

    const gameUpdates = {
      passes: 0,
      turn: game.turn + 1,
      resolving: null,
      lastEvent: {
        change: 'resolveFive',
        discardedCards: [card.id]
      },

    };

    const cardsToDraw = [];
    let newDeck = game.deck;
    let thirdCard;

    //1 extra because card is not yet removed from hand
    if (player.hand.length < 9) {
      cardsToDraw.push(game.topCard.id);
      gameUpdates.topCard = null;
      if (game.secondCard && player.hand.length < 8) {
        cardsToDraw.push(game.secondCard.id);
        gameUpdates.secondCard = null;
        if (game.deck.length > 1 && player.hand.length < 7) {
          thirdCard = _.sample(game.deck);
          cardsToDraw.push(thirdCard.id);
          newDeck = game.deck.filter(({ id }) => id !== thirdCard);
        }
      }
    }
  
    const logMessage = cardsToDraw.length === 1 ? `draws 1 card` : `draws ${cardsToDraw.length} cards`;
    gameUpdates.log = [...game.log, `${player.username} discards the ${getCardName(card)} and ${logMessage}`];
  
    if (game.deck.length > 1) {
      const [topCard, secondCard] = _.sampleSize(newDeck, 2);
      gameUpdates.topCard = topCard.id;
      gameUpdates.secondCard = secondCard.id;
    } else if (game.deck.length === 1) {
      [gameUpdates.topCard] = newDeck;
    }

    const updatePromises = [
      Game.updateOne(game.id).set(gameUpdates),
      Game.addToCollection(game.id, 'scrap').members([card.id]),
      Game.removeFromCollection(game.id, 'deck').members([thirdCard]),
      User.addToCollection(player.id, 'hand').members([...cardsToDraw]),
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
  } catch (err) {
    return res.badRequest(err);
  }
};