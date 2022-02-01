module.exports = function (req, res) {
  const pGame = gameService.findGame({gameId: req.session.game})
    .then(function checkTurn(game) {
      if (req.session.pNum === game.turn % 2) {
        if (game.topCard) {
          return Promise.resolve(game);
        } else {
          return Promise.reject({message: "The deck is empty; you cannot draw"});
        }
      } else {
        return Promise.reject({message: "It's not your turn."});
      }
    });

  const pUser = userService.findUser({userId: req.session.usr})
    .then(function handLimit(user) {
      if (user.hand.length < 8) {
        return Promise.resolve(user);
      } else {
        return Promise.reject({message: "You are at the hand limit; you cannot draw."});
      }
    });

  // Make changes after finding records
  Promise.all([pGame, pUser])
    .then(function changeAndSave(values) {
      const [game, user] = values;
      const updatePromises = [
        game,
        User.addToCollection(user.id, 'hand')
          .members(game.topCard.id),
      ];
      const gameUpdates = {
        topCard: null,
        log: [...game.log, user.username + " drew a card"],
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
          updatePromises.push(
            Game.removeFromCollection(game.id, 'deck')
              .members(newSecondCard.id)
          );
        } else {
          gameUpdates.secondCard = null;
        }
      }
      updatePromises.push(
        Game.updateOne({id: game.id})
          .set(gameUpdates),
        User.updateOne({id: user.id})
          .set(userUpdates)
      );

      return Promise.all(updatePromises);

    }) //End changeAndSave
    .then(function getPopulatedGame(values) {
      const game = values[0];
      return gameService.populateGame({gameId: game.id});
    }) //End getPopulatedGame
    .then(function publishAndRespond(fullGame) {
      Game.publish([fullGame.id], {
        verb: 'updated',
        data: {
          change: 'draw',
          game: fullGame,
        },
      });
      return res.ok();
    }) //End publishAndRespond
    .catch(function failed(err) {
      return res.badRequest(err);
    });
}
