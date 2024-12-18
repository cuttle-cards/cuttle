const GameStatus = require('../../../utils/GameStatus.json');
const DeckIds = require('../../../utils/DeckIds.json');
const MoveType = require('../../../utils/MoveType.json');
const GamePhase = require('../../../utils/GamePhase.json');

module.exports = {
  friendlyName: 'Deal Cards',

  description:
    'Creates initial GameStateRow for specified game, with cards dealt to both players (5 for p0 and 6 for p1). Errors if Game has previous game or incorrect status.',

  inputs: {
    game: {
      type: 'ref',
      description: 'Game record to be initialized with first GameState',
      extendedDescription: 'Game is expected to have populated collection of .gameStates',
      required: true,
    },
  },

  fn: async ({ game }, exits) => {
    try {
      if (game.status !== GameStatus.STARTED) {
        return exits.error({ message: 'Game has not yet started or is over' });
      }

      if (!game.gameStates) {
        return exits.error({ message: 'Game was not populated with .gameStates collection' });
      }

      if (game.gameStates.length) {
        return exits.error({ message: 'Cards are already dealt' });
      }

      const deck = _.shuffle(DeckIds.map((cardId) => sails.helpers.gameStates.convertStrToCard(cardId)));

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
        moveType: MoveType.DEAL,
        turn: 0,
        phase: GamePhase.MAIN,
        p0,
        p1,
        deck,
        scrap: [],
        twos: [],
        playedBy: 1, // p1 "deals"
        playedCard: null,
        targetCardId: null,
        discardedCards: [],
        oneOff: null,
        oneOffTarget: null,
        resolving: null,
      };

      const { saveGamestate, createSocketEvent } = sails.helpers.gameStates;
      const gameStateRow = await saveGamestate(newGameState);
      game.gameStates.push(gameStateRow);
      const socketEvent  = await createSocketEvent(game, newGameState);
      Game.publish([ game.id ], socketEvent);

      return exits.success(newGameState);
    } catch (err) {
      return exits.error(err);
    }
  },
};
