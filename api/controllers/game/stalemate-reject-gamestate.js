const GamePhase = require('../../../utils/GamePhase.json');
const MoveType = require('../../../utils/MoveType.json');
/**
 * Reject an opponent's request for stalemate
 */
module.exports = async function (req, res) {
  let game;
  try {
    const { saveGamestate, createSocketEvent, unpackGamestate } = sails.helpers.gameStates;
    game = await sails.helpers.lockGame(req.params.gameId);

    const currentGameState = unpackGamestate(game.gameStates.at(-1));
    if (!game.gameStates.length || !currentGameState) {
      throw new Error({ message: 'Game has not yet started' });
    }

    // Verify whether user is in requested game and as which player
    let playedBy;
    switch (req.session.usr) {
      case game.p0.id:
        playedBy = 0;
        break;
      case game.p1.id:
        playedBy = 1;
        break;
      default:
        throw new Error('You are not a player in this game!');
    }

    if (currentGameState.phase !== GamePhase.CONSIDERING_STALEMATE) {
      throw new Error('A stalemate has not been requested');    }

    if (game.gameStates.length < 2) {
      throw new Error('Something went wrong. Game is missing previous states');
    }

    if (playedBy === currentGameState.playedBy) {
      throw new Error('You cannot accept your own stalemate request');
    }

    const gameStateBeforeStalemate = unpackGamestate(game.gameStates.at(-2));

    // Set state to what it was previously,
    // with updated moveType and playedBy
    const updatedState = {
      ...gameStateBeforeStalemate,
      moveType: MoveType.STALEMATE_REJECT,
      playedBy,
    };
    
    const gameStateRow = await saveGamestate(updatedState);
    game.gameStates.push(gameStateRow);
    const socketEvent = await createSocketEvent(game, updatedState);
    Game.publish([ game.id ], socketEvent);
    await sails.helpers.unlockGame(game.lock);

    return res.ok();

  } catch (err) {
    // unlock game if failing due to validation
    if (game?.lock) {
      try {
        await sails.helpers.unlockGame(game.lock);
      } catch (err) {
        // fall through for generic error handling
      }
    }
    return res.badRequest(err);
  }
};
