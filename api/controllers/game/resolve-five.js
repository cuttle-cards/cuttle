const { getCardName } = require('../../../utils/game-utils');
module.exports = async function (req, res) {
  
  try {
    const promiseGame = gameService.findGame({ gameId: req.session.game });
    const promisePlayer = userService.findUser({ userId: req.session.usr });
    const promiseCard = req.body.cardId ? cardService.findCard({ cardId: req.body.cardId }) : null;
    const [game, player, cardToDiscard] = await Promise.all([promiseGame, promisePlayer, promiseCard]);

    if (!game.topCard) {
      throw new Error({ message: 'Cannot resolve 5 one-off with an empty deck' });
    }

    const gameUpdates = {
      passes: 0,
      turn: game.turn + 1,
      resolving: null,
      lastEvent: {
        change: 'resolveFive',
        discardedCards: cardToDiscard ? [cardToDiscard.id] : [],
      },
    };

    const cardsToDraw = [];
    const cardsToRemoveFromDeck = [];
    let newDeck = game.deck;
    
    //collect cards to put in players hand
    cardsToDraw.push(game.topCard.id);
    if (game.secondCard) {
      cardsToDraw.push(game.secondCard.id);
      //Add one to player hand length for card that is not yet discarded
      const playerHandLimit = cardToDiscard ? 6 : 7;
      if (game.deck.length && player.hand.length < playerHandLimit) {
        const thirdCard = _.sample(game.deck);
        cardsToDraw.push(thirdCard.id);
        cardsToRemoveFromDeck.push(thirdCard.id);
        newDeck = game.deck.filter(({ id }) => id !== thirdCard.id);
      }
    }
    
    //Update new topCard, secondCard, and deck
    gameUpdates.topCard = null;
    gameUpdates.secondCard = null;

    if (newDeck.length > 1) {
      const [topCard, secondCard] = _.sampleSize(newDeck, 2);
      gameUpdates.topCard = topCard.id;
      gameUpdates.secondCard = secondCard.id;
      cardsToRemoveFromDeck.push(topCard.id, secondCard.id);
    } else if (newDeck.length === 1) {
      const [topCard] = newDeck;
      gameUpdates.topCard = topCard.id;
      cardsToRemoveFromDeck.push(topCard.id);
    }
   
    const updatePromises = [
      Game.updateOne(game.id).set(gameUpdates),
      Game.removeFromCollection(game.id, 'deck').members([...cardsToRemoveFromDeck]),
      User.addToCollection(player.id, 'hand').members([...cardsToDraw]),
    ];

    const logMessage = cardsToDraw.length === 1 ? `draws 1 card` : `draws ${cardsToDraw.length} cards`;
    
    if (cardToDiscard) {
      updatePromises.push(Game.addToCollection(game.id, 'scrap').members([cardToDiscard.id]), User.removeFromCollection(player.id, 'hand').members([cardToDiscard.id]), );
      gameUpdates.log = [...game.log, `${player.username} discards the ${getCardName(cardToDiscard)} and ${logMessage}`];
    } else {
      gameUpdates.log = [...game.log, `${player.username} ${logMessage}`];
    }
    
    await Promise.all([...updatePromises]);
    const fullGame = await gameService.populateGame({ gameId: game.id });
    const victory = await gameService.checkWinGame({ game: fullGame });

    Game.publish([fullGame.id], {
      change: 'resolveFive',
      game: fullGame,
      victory,
      discardedCards: cardToDiscard ? [cardToDiscard.id] : null
    });

    return res.ok();
  } catch (err) {
    return res.badRequest(err);
  }
};
