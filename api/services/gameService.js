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
function compareByRankThenSuit(card1, card2) {
  let res = card1.rank - card2.rank;
  if (res === 0) {
    res = card1.suit - card2.suit;
  }
  return res;
}

async function fetchSpectatorUsernames(gameId) {
  const spectators = await UserSpectatingGame.find({
    gameSpectated: gameId,
  }).populate('spectator');
  return spectators
    .filter(({ activelySpectating }) => activelySpectating === true)
    .map(({ spectator }) => spectator.username);
}

// Used to create fully populated game
function tempUser(usr, points) {
const res = {
  ...usr,
  points,
};
delete res.encryptedPassword;

  this.hand.sort(compareByRankThenSuit);
  this.points.sort(compareByRankThenSuit);
  this.faceCards.sort(compareByRankThenSuit);
}

function tempGame(game, spectatingUsers, p0, p1) {
  Object.entries(game).forEach(([key, val]) => {
    if(key === 'players'){
      this[key] = [p0, p1];
      return;
    }
    if(key === 'spectatingUsers'){
      this[key] = spectatingUsers;
      return;
    }
    this[key] = val;
  });
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
      .populate('attachedToTarget')
      .populate('spectatingUsers');
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
   populateGame: async function(options) {
    try{
      if (!options) {
        if (!Object.hasOwnProperty.call(options, 'gameId') && !typeof options.gameId === 'number') {
          throw new Error({message: 'gameId is required and must be a number'});
        }
        throw new Error({ message: 'Cannot populate Game without GameId (options had no gameId)' }); 
      } 
      // find game
      const game = await gameService.findGame({ gameId: options.gameId });
      
      if (!game.players) {
        if (game.players.length < 2) {
          throw new Error({message: 'Cannot populate game without two players'});
        }
        throw new Error({message: 'Cannot populate game, because it does not have players collection'});
      }
      //find users and points
      const [p0, p1, spectatingUsers, p0Points, p1Points] = await Promise.all([
        userService.findUser({ userId: game.players[0].id }),
        userService.findUser({ userId: game.players[1].id }),
        fetchSpectatorUsernames(game.id),
        cardService.findPoints({ userId: game.players[0].id }),
        cardService.findPoints({ userId: game.players[1].id })
      ]);
      // then format results
      const populatedP0 = new tempUser(p0, p0Points);
      const populatedP1 = new tempUser(p1, p1Points);
      return new tempGame(game, spectatingUsers, populatedP0, populatedP1);
    }catch(err){ 
      return err.message;
     }
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
