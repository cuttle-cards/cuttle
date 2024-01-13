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
    const cardsToRemove= [];
    let newDeck = game.deck;
    
    //Add two for card that is not yet discarded and card that played one-off
    if (game.topCard) {
      cardsToDraw.push(game.topCard.id);
      gameUpdates.topCard = null;
      if (game.secondCard && player.hand.length < 9) {
        cardsToDraw.push(game.secondCard.id);
        gameUpdates.secondCard = null;
        if (game.deck.length > 1 && player.hand.length < 8) {
          const thirdCard = _.sample(game.deck);
          cardsToDraw.push(thirdCard.id);
          cardsToRemove.push(thirdCard.id);
          newDeck = game.deck.filter(({ id }) => id !== thirdCard.id);
        }
      }
      
      //Update new topCard, secondCard, and deck
      if (newDeck.length > 1) {
        const [topCard, secondCard] = _.sampleSize(newDeck, 2);
        gameUpdates.topCard = topCard.id;
        gameUpdates.secondCard = secondCard.id;
        cardsToRemove.push(topCard.id, secondCard.id);
      } else if (newDeck.length === 1) {
        const [topCard] = newDeck;
        gameUpdates.topCard = topCard;
        cardsToRemove.push(topCard.id);
      }
    } else {
      throw new Error({ message: 'Cannot resolve 5 one-off with an empty deck' });
    }
  
    const logMessage = cardsToDraw.length === 1 ? `draws 1 card` : `draws ${cardsToDraw.length} cards`;
    gameUpdates.log = [...game.log, `${player.username} discards the ${getCardName(card)} and ${logMessage}`];
  
    const updatePromises = [
      Game.updateOne(game.id).set(gameUpdates),
      Game.addToCollection(game.id, 'scrap').members([card.id]),
      Game.removeFromCollection(game.id, 'deck').members([...cardsToRemove]),
      User.removeFromCollection(player.id, 'hand').members([card.id]),
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