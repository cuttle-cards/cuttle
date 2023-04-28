const gameAPI = sails.hooks['customgamehook'];
const userAPI = sails.hooks['customuserhook'];

module.exports = function (req, res) {
  if (req.session.game && req.session.usr) {
    const promiseGame = gameAPI.findGame(req.session.game);
    const promiseUser = userAPI.findUser(req.session.usr);
    Promise.all([promiseGame, promiseUser])
      // Assign player readiness
      .then(function foundRecords(values) {
        const [game, user] = values;
        let { pNum } = user;
        let bothReady = false;
        const gameUpdates = {};
        switch (pNum) {
          case 0:
            gameUpdates.p0Ready = !game.p0Ready;
            if (game.p1Ready) {
              bothReady = true;
            }
            break;
          case 1:
            gameUpdates.p1Ready = !game.p1Ready;
            if (game.p0Ready) {
              bothReady = true;
            }
            break;
        }
        if (bothReady) {
          // Inform all clients this game has started
          sails.sockets.blast('gameStarted', { gameId: game.id });

          // Create Cards
          return new Promise(function makeDeck(resolveMakeDeck) {
            const findP0 = userService.findUser({ userId: game.players[0].id });
            const findP1 = userService.findUser({ userId: game.players[1].id });
            const data = [Promise.resolve(game), findP0, findP1];
            for (let suit = 0; suit < 4; suit++) {
              for (let rank = 1; rank < 14; rank++) {
                const promiseCard = cardService.createCard({
                  gameId: game.id,
                  suit,
                  rank,
                });
                data.push(promiseCard);
              }
            }
            return resolveMakeDeck(Promise.all(data));
          })
            .then(function deal(values) {
              const [game, p0, p1, ...deck] = values;

              // Shuffle deck & map cards => thier ids
              const shuffledDeck = _.shuffle(deck).map((card) => card.id);
              // Take 1st 5 cards for p0
              const dealToP0 = shuffledDeck.splice(0, 5);
              // Take next 6 cards for p1
              const dealToP1 = shuffledDeck.splice(0, 6);
              // Take next 2 cards for topcard & secondCard
              gameUpdates.topCard = shuffledDeck.shift();
              gameUpdates.secondCard = shuffledDeck.shift();
              gameUpdates.lastEvent = {
                change: 'Initialize',
              };
              gameUpdates.p0 = p0.id;
              gameUpdates.p1 = p1.id;

              // Update records
              const updatePromises = [
                // Deal to p0
                User.replaceCollection(p0.id, 'hand').members(dealToP0),
                // Deal to p1
                User.replaceCollection(p1.id, 'hand').members(dealToP1),
                // Replace Deck
                Game.replaceCollection(game.id, 'deck').members(shuffledDeck),
                // Other game updates
                Game.updateOne({ id: game.id }).set(gameUpdates),
              ];

              return Promise.all([game, p0, p1, ...updatePromises]);
            })
            .then(function getPopulatedGame(values) {
              return gameService.populateGame({ gameId: values[0].id });
            })
            .then(function publish(fullGame) {
              Game.publish([fullGame.id], {
                change: 'Initialize',
                game: fullGame,
              });
              return Promise.resolve(fullGame);
            })
            .catch(function failedToDeal(err) {
              return Promise.reject(err);
            });
          // If this player is first to be ready, save and respond
        }
        Game.publish([game.id], {
          change: 'ready',
          userId: user.id,
          pNum: user.pNum,
          gameId: game.id,
        });
        return Game.updateOne({ id: game.id }).set(gameUpdates);
      }) //End foundRecords
      .then(function respond() {
        return res.ok();
      })
      .catch(function failed(err) {
        return res.badRequest(err);
      });
  } else {
    const err = { message: 'Missing game or player id' };
    return res.badRequest(err);
  }
};
