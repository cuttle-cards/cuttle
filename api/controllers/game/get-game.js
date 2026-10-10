const NotFoundError = require('../../errors/notFoundError');
const CustomErrorType = require('../../errors/customErrorType.js');
const GameStatus = require('../../../utils/GameStatus.json');

module.exports = async function(req, res) {
  const { gameId } = req.params;
  try {
    const game = await Game.findOne({ id: gameId })
      .populate('p0')
      .populate('p1')
      .populate('gameStates', { sort: 'createdAt ASC' })
      .populate('spectatingUsers');

    if (!game) {
      throw new NotFoundError(`Can't find Game ${ gameId }`);
    }

    // Room membership follows identity even when a finished game reveals cards.
    let userRelationship = 'spectator';
    const gameIsFinished = [ GameStatus.FINISHED, GameStatus.ARCHIVED ].includes(game.status);

    if (req.session.usr === game.p0?.id) {
      userRelationship = 'p0';
    } else if (req.session.usr === game.p1?.id) {
      userRelationship = 'p1';
    } else {
      // Check if user is already spectating this game
      const existingSpectator = game.spectatingUsers?.find(usg => usg.spectator === req.session.usr);
      if (!existingSpectator) {
        // Make user a spectator by creating spectatingUsers row
        await UserSpectatingGame.create({ 
          gameSpectated: game.id, 
          spectator: req.session.usr 
        });
      }
    }

    // Join socket room for the correct player perspective for this game
    const roomName = `game_${gameId}_${userRelationship}`;
    sails.sockets.join(req, roomName);

    if (!game.gameStates.length) {
      return res.ok({
        ...game,
        p0: game.p0?.username ?? null,
        p1: game.p1?.username ?? null
      });
    }

    const {  unpackGamestate, createSocketEvents } = sails.helpers.gameStates;

    let gameStateIndex = Number(req.query.gameStateIndex);
    const isValidGameStateIndex = Number.isInteger(gameStateIndex) && gameStateIndex >= -1;
    gameStateIndex = isValidGameStateIndex ? gameStateIndex : gameIsFinished ? 0 : -1;
    const packedGameState = game.gameStates.at(gameStateIndex);

    if (!packedGameState) {
      throw new NotFoundError(`Can't find gameState ${gameStateIndex} for game ${gameId}`);
    }

    const gameState = unpackGamestate(packedGameState);
    const socketEvents = await createSocketEvents(game, gameState);

    // Finished games reveal all cards, but players must stay in their player
    // rooms so a rematch sends them only their own perspective of the new game.
    const statePerspective = gameIsFinished ? 'spectator' : userRelationship;
    const response = socketEvents[`${statePerspective}State`];

    return res.ok(response);

  } catch (err) {
    const message = err?.raw?.message ?? err?.message ?? err;
    switch (err?.code) {
      case CustomErrorType.NOT_FOUND:
        return res.status(404).json({ message });
      default:
        return res.serverError(message);
    }
  }
};
