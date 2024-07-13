const GameStatus = require('../../../utils/GameStatus.json');
const DeckIds = require('../../../utils/DeckIds.json');
const MoveType = require('../../../utils/MoveType.json');
const GamePhase = require('../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Deal Cards',

  description: 'Creates initial GameStateRow for specified game, with cards dealt ot both players (5 for p0 and 6 for p1). Errors if Game has previous game or incorrec status.',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game record to be initialized with first GameState',
      required: true,
    },
  },

  fn: async ({ game }, exits) => {
    
    try {
      if (game.status !== GameStatus.CREATED) {
        return exits.error({ message: 'Game has already started' });
      }

      const previousGameStates = await GameStateRow.find({ gameId: game.id});
      if (previousGameStates?.length) {
        return exits.error({ message: 'Cards are already dealt' });
      }

      const deck = _.shuffle(
        DeckIds.map(sails.helpers.gameStates.convertCardIdToCard)
      );

      const p0 = {
        hand: deck.splice(0, 5),
        points: [],
        faceCards: [],
      };

      const p1 = {
        hand: deck.splice(0, 6),
        points: [],
        faceCards: [],
      };
      const newGameState = {
        gameId: game.id,
        moveType: MoveType.INITIALIZE,
        turn: 0,
        phase: GamePhase.MAIN,
        p0,
        p1,
        deck,
        scrap: [],
        twos: [],
        playedBy: null,
        playedCard: null,
        targetCardId: null,
        discardedCards: [],
        oneOff: null,
        oneOffTarget: null,
        resolving: null,
      };

      await sails.helpers.gameState.saveGameState(newGameState);

      await sails.helpers.gameState.emitGameState(game, newGameState);
      return exits.success(newGameState);
    } catch (err) {
      return exits.error(err);
    }
  },
};
