module.exports = function (req, res) {
  const pGame = gameService.findGame({ gameId: req.session.game }).then(function checkTurnAndOneOff(game) {
    if (game.oneOff) {
      return Promise.reject({ message: "Can't play while waiting for opponent to counter" });
    }
    if (req.session.pNum === game.turn % 2) {
      if (game.topCard) {
        return Promise.resolve(game);
      }
      return Promise.reject({ message: 'game.snackbar.draw.deckIsEmpty' });
    }
    return Promise.reject({ message: 'game.snackbar.global.notYourTurn' });
  });

  const pUser = userService.findUser({ userId: req.session.usr }).then(function handLimit(user) {
    if (user.hand.length < 8) {
      return Promise.resolve(user);
    }
    return Promise.reject({ message: 'game.snackbar.draw.handLimit' });
  });

  // Make changes after finding records
  Promise.all([ pGame, pUser ])
    .then(function changeAndSave(values) {
      const [ game, user ] = values;
      const updatePromises = [ game, User.addToCollection(user.id, 'hand').members(game.topCard.id) ];
      const gameUpdates = {
        topCard: null,
        log: [ ...game.log, `${user.username} drew a card` ],
        turn: game.turn + 1,
        lastEvent: {
          change: 'draw',
        },
      };
      const userUpdates = {
        frozenId: null,
      };
      if (game.secondCard) {
        // Replace Top card if second card exists
        gameUpdates.topCard = game.secondCard.id;
        // Replace second card if deck isn't empty
        if (game.deck.length > 0) {
          const newSecondCard = _.sample(game.deck);
          gameUpdates.secondCard = newSecondCard.id;
          updatePromises.push(Game.removeFromCollection(game.id, 'deck').members(newSecondCard.id));
        } else {
          gameUpdates.secondCard = null;
        }
      }
      updatePromises.push(
        Game.updateOne({ id: game.id }).set(gameUpdates),
        User.updateOne({ id: user.id }).set(userUpdates),
      );

      return Promise.all(updatePromises);
    }) // End changeAndSave
    .then(function getPopulatedGame(values) {
      const [ game ] = values;
      return gameService.populateGame({ gameId: game.id });
    }) // End getPopulatedGame
    .then(function publishAndRespond(fullGame) {
      Game.publish([ fullGame.id ], {
        change: 'draw',
        game: fullGame,
      });
      return res.ok();
    }) // End publishAndRespond
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
