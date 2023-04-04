const userService = require('../../api/services/userService.js');

/**
 * Game result states
 */
const GameResult = Object.freeze({
  INCOMPLETE: -1,
  P0_WINS: 0,
  P1_WINS: 1,
  STALEMATE: 2,
});

/**
 * @returns int <= 0 if card1 is lower rank or same rank & lower suit
 * @param {rank: number, suit: number} card1
 * @param {rank: number, suit: number} card2
 */
function comapreByRankThenSuit(card1, card2) {
  let res = card1.rank - card2.rank;
  if (res === 0) {
    res = card1.suit - card2.suit;
  }
  return res;
}

// Used to create fully populated game
function tempUser(usr, points) {
  this.pNum = usr.pNum;
  this.hand = usr.hand;
  this.points = points;
  this.faceCards = usr.faceCards;
  this.frozenId = usr.frozenId;
  this.id = usr.id;
  this.username = usr.username;

  this.hand.sort(comapreByRankThenSuit);
  this.points.sort(comapreByRankThenSuit);
  this.faceCards.sort(comapreByRankThenSuit);
}

function tempGame(game, p0, p1) {
  this.id = game.id;
  this.players = [p0, p1];
  this.spectators = game.spectators;
  this.deck = game.deck;
  this.scrap = game.scrap;
  this.topCard = game.topCard;
  this.secondCard = game.secondCard;
  this.oneOff = game.oneOff;
  this.oneOffTarget = game.oneOffTarget;
  this.twos = game.twos;
  this.log = game.log;
  this.chat = game.chat;
  this.id = game.id;
  this.turn = game.turn;
  this.passes = game.passes;
  this.resolving = game.resolving;
  this.lastEvent = game.lastEvent;
  this.result = game.result;
  this.isRanked = game.isRanked;
  this.p0 = game.p0;
  this.p1 = game.p1;
  this.p0Ready = game.p0Ready;
  this.p1Ready = game.p1Ready;
}
module.exports = {
  GameResult,
  /**
   * Find game by id and return it as a Promise
   **** options = {gameId: integer}
   */
  findGame: function (options) {
    return Game.findOne(options.gameId)
      .populate('players', { sort: 'pNum' })
      .populate('deck')
      .populate('scrap')
      .populate('topCard')
      .populate('secondCard')
      .populate('oneOff')
      .populate('resolving')
      .populate('twos', { sort: 'updatedAt' })
      .populate('oneOffTarget')
      .populate('attachedToTarget');
  },

  /*
   ** Save game and return it as a Promise
   ****options = {game: GameModel}
   */
  saveGame: function (options) {
    const { game } = options;
    return Game.updateOne({ id: game.id }).set(game);
  },

  /*
   ** Return a fully populated Game as a Promise
   ****options = {gameId: gameId}
   */
  populateGame: function (options) {
    return new Promise(function (resolve, reject) {
      if (options) {
        if (Object.hasOwnProperty.call(options, 'gameId') && typeof options.gameId === 'number') {
          // find game
          return (
            gameService
              .findGame({ gameId: options.gameId })
              // then find users
              .then(function findUsers(game) {
                if (game.players) {
                  if (game.players.length > 1) {
                    const p0 = userService.findUser({ userId: game.players[0].id });
                    const p1 = userService.findUser({ userId: game.players[1].id });
                    return Promise.all([Promise.resolve(game), p0, p1]);
                  }
                  return Promise.reject({ message: "Can't populate game without two players" });
                }
                return Promise.reject({
                  message: "Can't populate game, because it does not have players collection",
                });
              })
              // find spectators
              .then(function findSpectators(values) {
                const [game, p0, p1] = values;
                const { spectators } = game;
                return [game, p0, p1, spectators];
              })
              // then find points
              .then(function findPoints(values) {
                const [game, p0, p1, spectators] = values;
                const p0Points = cardService.findPoints({ userId: p0.id });
                const p1Points = cardService.findPoints({ userId: p1.id });
                return Promise.all([
                  Promise.resolve(game),
                  Promise.resolve(p0),
                  Promise.resolve(p1),
                  p0Points,
                  p1Points,
                  spectators,
                ]);
              })
              // then format results & resolve
              .then(function finish(values) {
                const [game, p0, p1, p0Points, p1Points, spectators] = values;
                const populatedP0 = new tempUser(p0, p0Points);
                const populatedP1 = new tempUser(p1, p1Points);
                const result = new tempGame(game, populatedP0, populatedP1, spectators);

                return resolve(result);
              })
              .catch(function failed(err) {
                reject(err);
              })
          );
        }
        reject({ message: 'gameId is required and must be a number' });
      } else {
        reject({ message: 'Cannot populate Game without GameId (options had no gameId)' });
      }
    });
  }, //End populateGame()
  /*
   ** Checks a game to determine if either player has won
   * @param options = {game: tmpGame, gameModel: GameModel}
   */
  checkWinGame: async function (options) {
    const res = {
      gameOver: false,
      winner: null,
      conceded: false,
      currentMatch: null,
    };
    let { game } = options;
    const p0Wins = userService.checkWin({ user: game.players[0] });
    const p1Wins = userService.checkWin({ user: game.players[1] });
    if (p0Wins || p1Wins) {
      res.gameOver = true;
      const gameUpdates = {};
      if (p0Wins) {
        res.winner = 0;
        gameUpdates.result = GameResult.P0_WINS;
      } else if (p1Wins) {
        res.winner = 1;
        gameUpdates.result = GameResult.P1_WINS;
      }
      await Game.updateOne({ id: game.id }).set(gameUpdates);
      game = {
        ...game,
        ...gameUpdates,
      };
      if (game.isRanked) {
        res.currentMatch = await sails.helpers.addGameToMatch(game);
      }
    }
    return res;
  },

  /* Takes a user id and clears all game data
   * from the associated user
   */
  clearGame: async function (options) {
    return User.findOne(options.userId)
      .populateAll()
      .then(function findUserGame(player) {
        // If no session game id, ensure player's collections are emptied
        if (!player.game) {
          return Promise.all([
            User.updateOne({ id: player.id }).set({ pNum: null }),
            User.replaceCollection(player.id, 'hand').members([]),
            User.replaceCollection(player.id, 'points').members([]),
            User.replaceCollection(player.id, 'faceCards').members([]),
          ]);
        }
        // Otherwise find the game
        return gameService
          .findGame({ gameId: player.game.id })
          .then(function clearGameData(game) {
            const updatePromises = [];
            if (game) {
              const cardsOnGame = [];
              if (game.topCard) {
                cardsOnGame.push(game.topCard.id);
                if (game.secondCard) {
                  cardsOnGame.push(game.secondCard.id);
                }
              }
              if (game.OneOff) {
                cardsOnGame.push(game.oneOff.id);
              }
              if (game.resolving) {
                cardsOnGame.push(game.resolving.id);
              }
              const playerIds = game.players.map((player) => player.id);
              // Create (inclusive or) criteria for cards to delete
              let deleteCardsCriteria = [
                // Cards attached directly to game
                { id: cardsOnGame }, // top & second cards
                { deck: game.id },
                { scrap: game.id },
                { twos: game.id },
                { targeted: game.id },
                // Cards attached to players
                { hand: playerIds },
                { points: playerIds },
                { faceCards: playerIds },
                // NOTE: jacks in play should be destroyed using CASCADE on foreign key constraint on attachedTo
              ];
              updatePromises.push(
                // Remove players from game
                Game.replaceCollection(game.id, 'players').members([]),
                // Set pNum's to null
                User.update({ id: playerIds }).set({
                  pNum: null,
                }),
                // Delete all cards in the game
                Card.destroy({
                  or: deleteCardsCriteria,
                }),
                // Inform all clients this game is over
                sails.sockets.blast('gameFinished', { gameId: game.id }),
              );
            } // end if (game) {}
            return Promise.all(updatePromises);
          }) // End clearGameData()
          .catch(function failed(err) {
            return Promise.reject(err);
          });
      });
  },

  /**
   * Used to replace card played via a seven from the deck
   * @param {*} options: {game: GameModel, index: integer}
   * index = 0 iff topcard was played, 1 iff secondCard was played
   * @returns {topCard: int, secondCard: int, cardsToRemove: int[]}
   * Does not change records -- only returns obj for game updates
   * SYNCHRONOUS
   */
  sevenCleanUp: function (options) {
    const { game, index } = options;
    const cardsToRemoveFromDeck = [];
    const res = {
      topCard: game.topCard.id,
      secondCard: null,
      cardsToRemoveFromDeck,
    };
    // Re-assign top card if top card was played (and second card exists)
    if (index === 0) {
      if (game.secondCard) {
        res.topCard = game.secondCard.id;
      } else {
        res.topCard = null;
      }
    }
    // If there are more cards in the deck, assign secondCard
    if (game.deck.length > 0) {
      const newSecondCard = _.sample(game.deck).id;
      res.secondCard = newSecondCard;
      cardsToRemoveFromDeck.push(newSecondCard);
    }
    return res;
  },
};
