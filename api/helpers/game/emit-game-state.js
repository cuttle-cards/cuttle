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
    //Combine game and gamestate users and delete passwords
    const p0 = { ...game.p0, ...gameState.p0 };
    delete p0.encryptedPassword;
    const p1 = { ...game.p1, ...gameState.p1 };
    delete p1.encryptedPassword;
    const players = [p0, p1];

    const lastEventChange = Object.keys(GameMoveType).find((key) => GameMoveType[key] === gameState.moveType);
    const lastEventPlayerChoosing = lastEventChange === 'resolveThree' ? gameState.playedBy : null;
    const lastEventTargetType = gameState.targetCard?.rank > 10 ? 'faceCard' : 'point';
    //Only define what is changing, rest is defined by spread operator
    const populatedGame = {
      ...game,
      ...gameState,
      players,
      deck: gameState.deck.slice(2),
      topCard: gameState.deck[0],
      secondCard: gameState.deck[1],
      currentMatch: game.match,
      lastEvent: {
        change: lastEventChange,
        oneOffRank: gameState.oneOff?.rank,
        targetType: lastEventTargetType,
        cardChosen: gameState.chosenCard,
        playerChoosing: lastEventPlayerChoosing,
        discardedCards: gameState.discardedCards,
      },
    };

    const victory = await sails.helpers.game.checkGameStateForWin(game, players);

    Game.publish([game.id], {
      change: lastEventChange,
      game: populatedGame,
      victory,
    });

    if (victory) {
      sails.sockets.blast('gameFinished', { gameId: game.id });
    }

    return exits.success(victory, game);
  },
};
