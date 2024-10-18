// Pass turn to other player (when deck has run out)
module.exports = function (req, res) {
  const promiseGame = gameService.findGame({ gameId: req.session.game });
  const promisePlayer = userService.findUser({ userId: req.session.usr });
  return Promise.all([ promiseGame, promisePlayer ])
    .then(function changeAndSave(values) {
      const [ game, player ] = values;
      const playerUpdates = {};
      let gameUpdates = {
        turn: game.turn + 1,
        passes: game.passes + 1,
        log: [ ...game.log, `${player.username} passes` ],
      };
      const updatePromises = [];
      if (game.turn % 2 === player.pNum) {
        // Passing is only allowed if the deck is empty
        if (!game.topCard) {
          playerUpdates.frozenId = null;
          gameUpdates = {
            turn: game.turn + 1,
            passes: game.passes + 1,
            log: [ ...game.log, `${player.username} passes` ],
            lastEvent: {
              change: 'pass',
            },
          };
        } else {
          return Promise.reject({
            message: 'You can only pass when there are no cards in the deck',
          });
        }
        updatePromises.push(
          Game.updateOne({ id: game.id }).set(gameUpdates),
          User.updateOne({ id: player.id }).set(playerUpdates),
        );
        return Promise.all([ game, ...updatePromises ]);
      }
      return Promise.reject({ message: "It's not your turn." });
    })
    .then(function populateGame(values) {
      const [ game ] = values;
      return gameService.populateGame({ gameId: game.id });
    })
    .then(async function publishAndRespond(game) {
      const victory = {
        gameOver: false,
        winner: null,
        currentMatch: null,
      };
      // Game ends in stalemate if 3 passes are made consecutively
      if (game.passes > 2) {
        victory.gameOver = true;
        const { players } = game;
        const gameUpdates = {
          p0: players[0].id,
          p1: players[1].id,
          status: gameService.GameStatus.FINISHED,
          winner: null
        };
        await Game.updateOne({ id: game.id }).set(gameUpdates);
        
        game = await gameService.populateGame({ gameId: game.id });
        victory.currentMatch = await sails.helpers.addGameToMatch(game);
        
        await Game.updateOne({ id: game.id }).set({
          lastEvent: {
            change: 'pass',
            game: game,
            victory
          }
        });
        await gameService.clearGame({ userId: req.session.usr });
      }
      Game.publish([ game.id ], {
        change: 'pass',
        game,
        victory,
      });
      return res.ok();
    })
    .catch(function failed(err) {
      return res.badRequest(err);
    });
};
