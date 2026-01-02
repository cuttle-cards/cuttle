// Request to have the AI make a move
const CustomErrorType = require('../../../errors/customErrorType');
const NotFoundError = require('../../../errors/notFoundError');
const ForbiddenError = require('../../../errors/forbiddenError');
const BadRequestError = require('../../../errors/badRequestError');
const ConflictError = require('../../../errors/conflictError');
const GameStatus = require('../../../../utils/GameStatus');

module.exports = async function (req, res) {
  let game;
  const { saveGamestate, publishGameState, unpackGamestate } = sails.helpers.gameStates;
  try {
    ///////////////////////////
    // Fetch and format data //
    ///////////////////////////
    game = await sails.helpers.lockGame(req.params.gameId);

    //////////////////////
    // Validate Request //
    //////////////////////
    if (!game) {
      throw new NotFoundError(`Could not find game ${ req.params.gameId }`);
    }

    if (!game.isVsAi) {
      throw new BadRequestError('This game is pvp!');
    }

    const gameState = unpackGamestate(game.gameStates.at(-1));
    // Game must be in progress
    if (!game?.gameStates?.length || !gameState) {
      throw new BadRequestError('Game has not yet started');
    }

    // Requesting user must be in this game
    let playedBy;
    switch (req.session.usr) {
      case game.p0.id:
        playedBy = 1;
        break;
      case game.p1.id:
        playedBy = 0;
        break;
      default:
        throw new ForbiddenError('You are not a player in this game!');
    }

    if ([ GameStatus.FINISHED, GameStatus.ARCHIVED ].includes(game.status)) {
      throw new ConflictError('game', game.id, 'Can\'t make move: this game is over');
    }

    ///////////////////////////////
    // Execute & Publish Changes //
    ///////////////////////////////
    const updatedState = sails.helpers.gameStates.ai.chooseAiMove(gameState, playedBy, game.gameStates);
    if (!updatedState) {
      throw new BadRequestError('AI has no legal moves!');
    }
    const gameStateRow = await saveGamestate(updatedState);
    game.gameStates.push(gameStateRow);
    await publishGameState(game, { ...updatedState, id: gameStateRow.id });

    //////////////////////////
    // Unlock & Respond 200 //
    //////////////////////////
    await sails.helpers.unlockGame(game.lock);
    return res.ok();

  } catch (err) {
    try {
      await sails.helpers.unlockGame(game.lock);
    } catch (err) {
      // Swallow if unlockGame errors, then respond based on error type
    }

    const message = err?.message ?? err ?? 'Error making move';
    switch (err?.code) {
      case CustomErrorType.NOT_FOUND:
        return res.status(404).json({ message });
      case CustomErrorType.FORBIDDEN:
        return res.forbidden({ message });
      case CustomErrorType.BAD_REQUEST:
        return res.badRequest({ message });
      default:
        return res.serverError({ message });
    }
  }
};
