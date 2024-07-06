import GameMoveType from '../../../utils/GameMoveType.json';

module.exports = {
  friendlyName: 'Emit Game State',

  description: 'Determines if the game has ended and sends a socket event based on the game status.',

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
    let victory;

    const lastEventChange = Object.keys(GameMoveType).find((key) => GameMoveType[key] === gameState.moveType);
    const lastEventOneOffRank = lastEventChange === 'resolve' ? gameState.oneOff?.rank : null;
    const lastEventCardChosen = lastEventChange === 'resolveThree' ? gameState.chosenCard : null;
    const lastEventPlayerChoosing = lastEventChange === 'resolveThree' ? gameState.playedBy : null;
    const lastEventDiscardedCards = lastEventChange === 'resolveFour' ? gameState.discardedCards : null;

    const populatedGame = {
      ...game,
      ...gameState,
      players: [
        { ...game.p0, ...gameState.p0 },
        { ...game.p1, ...gameState.p1 },
      ],
      p0Ready: game.p0Ready,
      p1Ready: game.p1Ready,
      deck: gameState.deck.slice(2),
      topCard: gameState.deck[0],
      secondCard: gameState.deck[1],
      currentMatch: game.match,
      lastEvent: {
        change: lastEventChange,
        oneOffRank: lastEventOneOffRank,
        cardChosen: lastEventCardChosen,
        playerChoosing: lastEventPlayerChoosing,
        discardedCards: lastEventDiscardedCards,
      },
    };

    Game.publish([game.id], {
      change: lastEventChange,
      game: populatedGame,
      victory,
    });

    return exits.success(victory, game);
  },
};
