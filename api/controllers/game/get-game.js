const NotFoundError = require('../../errors/notFoundError');
const CustomErrorType = require('../../errors/customErrorType.js');
const GameStatus = require('../../../utils/GameStatus.json');

module.exports = async function(req, res) {
  const { gameId } = req.params;
  try {
    const game = await Game.findOne({ id: gameId })
      .populate('p0')
      .populate('p1')
      .populate('gameStates', { sort: 'createdAt ASC' });

    if (!game) {
      throw new NotFoundError(`Can't find Game ${ gameId }`);
    }

    let pNum;
    switch (req.session.usr) {
      case game.p0.id:
        pNum = 0;
        break;
      case game.p1.id:
        pNum = 1;
        break;
      default:
        pNum = 'spectator';
    }

    // Join socket room for the correct player perspective for this game
    const roomName = `game_${gameId}_p${pNum}`;
    sails.sockets.join(req, roomName);

    if (!game.gameStates.length) {
      return res.ok({
        ...game,
        p0: game.p0?.username ?? null,
        p1: game.p1?.username ?? null
      });
    }

    const {  unpackGamestate, createSocketEvent } = sails.helpers.gameStates;

    let gameStateIndex = Number(req.query.gameStateIndex);
    const isValidGameStateIndex = Number.isInteger(gameStateIndex) && gameStateIndex >= -1;
    gameStateIndex = isValidGameStateIndex ? gameStateIndex :
      [ GameStatus.FINISHED, GameStatus.ARCHIVED ]
        .includes(game.status) ? 0 : -1;
    const packedGameState = game.gameStates.at(gameStateIndex);

    if (!packedGameState) {
      throw new NotFoundError(`Can't find gameState ${gameStateIndex} for game ${gameId}`);
    }

    const gameState = unpackGamestate(packedGameState);
    const response = await createSocketEvent(game, gameState);

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
