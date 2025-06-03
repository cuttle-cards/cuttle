const NotFoundError = require('../../errors/notFoundError');
const CustomErrorType = require('../../errors/customErrorType.js');

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

    Game.subscribe(req, [ gameId ]);

    if (!game.gameStates.length) {
      return res.ok({
        ...game,
        p0: game.p0?.username ?? null,
        p1: game.p1?.username ?? null
      });
    }

    const {  unpackGamestate, createSocketEvent } = sails.helpers.gameStates;

    const gameStateIndex = Number(req.query.gameStateIndex ?? -1);
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
