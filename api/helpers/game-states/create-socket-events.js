const MoveType = require('../../../utils/MoveType.json');
const GamePhase = require('../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Create Socket Events',

  description: 'Creates three Socket events (p0State, p1State, spectatorState) with asymmetric information',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game overview object',
      required: true,
    },
    gameState: {
      type: 'ref',
      description: 'Game state object',
      required: true,
    },
  },

  fn: async function ({ game, gameState }, exits) {
    try {
      // Combine game and gamestate users and delete passwords
      const p0 = { ...game.p0, ...gameState.p0, pNum: 0 };
      delete p0.encryptedPassword;
      const p1 = { ...game.p1, ...gameState.p1, pNum: 1 };
      delete p1.encryptedPassword;

      const players = [ p0, p1 ];

      const countPasses = (function () {
        let numPasses = 0;
        const currentIndex = game.gameStates.findIndex(gs => gs.id === gameState.id);
        const threeUpToCurrent = game.gameStates.slice(Math.max(0, currentIndex - 2), currentIndex + 1);

        for (const gameState of threeUpToCurrent) {
          if (gameState.moveType !== MoveType.PASS) {
            return numPasses;
          }
          numPasses++;
        }
        return numPasses;
      })();

      const victory = await sails.helpers.gameStates.checkGameStateForWin(game, gameState, countPasses);

      const fullLog = sails.helpers.gameStates.getLog(game);

      // Last Event, and Extra Socket Variables
      const happened = gameState.moveType !== MoveType.FIZZLE;
      let { playedBy } = gameState;

      // When resolving, the player who resolves is the opponent
      // of the one who played the one-off (if the one-off doesn't fizzle)
      if ( gameState.moveType === MoveType.RESOLVE ) {
        playedBy = (playedBy + 1) % 2;
      }

      const discardedCards = gameState.discardedCards.length ? gameState.discardedCards : null;
      const chosenCard = gameState.moveType === MoveType.RESOLVE_THREE ? gameState.targetCard : null;
      const pNum = playedBy;

      // Include formatted prior gameStates
      const gameStates = game.gameStates.map((priorGameState) => {
        return _.pick(priorGameState, [
          'createdAt',
          'moveType',
          'playedBy',
          'playedCard',
          'targetCard',
          'discardedCards',
          'resolved',
        ]);
      });

      // Fetch list of spectating usernames
      let spectatingUsers = await UserSpectatingGame.find({
        gameSpectated: game.id,
      }).populate('spectator');
      spectatingUsers = spectatingUsers
        .filter(({ activelySpectating }) => activelySpectating === true)
        .map(({ spectator }) => spectator.username);

      // Helper function to create hidden card placeholder
      const createHiddenCard = () => ({ isHidden: true });

      // Helper function to hide opponent's hand cards
      const hideOpponentHand = (playerIndex, originalPlayers) => {
        const hasGlassesEight = originalPlayers[playerIndex]?.faceCards?.some(card => card.rank === 8);
        const deckIsEmpty = gameState.deck.length === 0;

        return originalPlayers.map((player, index) => {
          const isPlayer = index === playerIndex;
          if (isPlayer || hasGlassesEight || deckIsEmpty) {
            return player;
          }

          return {
            ...player,
            hand: player.hand.map(createHiddenCard),
          };
        });
      };

      // Helper function to create deck with visibility rules
      const hideDeck = () => {
        const isResolvingSeven = gameState.phase === GamePhase.RESOLVING_SEVEN;
        
        // Show deck if: resolving seven (first two cards only)
        if (isResolvingSeven) {
          return [
            ...gameState.deck.slice(0, 2), // First two cards visible
            ...gameState.deck.slice(2).map(createHiddenCard) // Rest hidden
          ];
        }
        return gameState.deck.map(createHiddenCard); // All cards hidden
      };

      // Create base socket game object (spectator state)
      const baseSocketGame = {
        players,
        id: game.id,
        createdAt: game.createdAt,
        updatedAt: gameState.createdAt,
        name: game.name,
        chat: game.chat,
        status: game.status,
        p0Ready: game.p0Ready,
        p1Ready: game.p1Ready,
        p0Rematch: game.p0Rematch,
        p1Rematch: game.p1Rematch,
        lock: game.lock,
        lockedAt: game.lockedAt,
        rematchGame: game.rematchGame,
        spectatingUsers,
        isRanked: game.isRanked,
        winner: victory.winner,
        match: victory.currentMatch,
        log: fullLog,
        passes: countPasses,
        turn: gameState.turn,
        phase: gameState.phase,
        deck: gameState.deck,
        scrap: gameState.scrap,
        twos: gameState.twos,
        resolved: gameState.resolved,
        oneOff: gameState.oneOff,
        oneOffTarget: gameState.oneOffTarget,
        oneOffTargetType: gameState.oneOffTargetType,
        lastEvent: {
          change: gameState.moveType,
          pNum,
          happened,
          // Conditionally included properties if truthy
          ...(gameState.resolved && { oneOff: gameState.resolved }),
          ...(chosenCard && { chosenCard }),
          ...(discardedCards && { discardedCards }),
        },
        gameStates,
      };

      const change = gameState.moveType;

      const baseSocketEvent = {
        change,
        game: baseSocketGame,
        victory,
        happened,
        playedBy,
        pNum,
        // Conditionally included properties if truthy
        ...(gameState.playedCard && { playedCard: gameState.playedCard }),
        ...(gameState.targetCard && { targetCard: gameState.targetCard }),
        ...(gameState.resolved && { oneOff: gameState.resolved }),
        ...(chosenCard && { chosenCard }),
        ...(discardedCards && { discardedCards }),
      };

      // Create spectator state (full visibility)
      const spectatorState = { ...baseSocketEvent };

      // Create p0 state (asymmetric visibility)
      const p0State = {
        ...baseSocketEvent,
        game: {
          ...baseSocketGame,
          players: hideOpponentHand(0, players),
          deck: hideDeck(),
        }
      };

      // Create p1 state (asymmetric visibility)
      const p1State = {
        ...baseSocketEvent,
        game: {
          ...baseSocketGame,
          players: hideOpponentHand(1, players),
          deck: hideDeck(),
        }
      };

      if (victory.gameOver) {
        sails.sockets.blast('gameFinished', { gameId: game.id });
      }

      return exits.success({
        p0State,
        p1State,
        spectatorState
      });
    } catch (err) {
      return exits.error(`Error emitting socket: ${err.message}`);
    }
  },
};
